import itertools
import time
from unittest.mock import Mock, patch

import requests
from django.test import TestCase, override_settings

from friendly_captcha_client.schemas import FriendlyCaptchaResult

from mandoBot import captcha
from mandoBot.captcha import Verdict


def sdk_result(should_accept, was_able_to_verify):
    """A genuine SDK result object, so these tests assert on its real shape."""
    return FriendlyCaptchaResult(
        should_accept=should_accept, was_able_to_verify=was_able_to_verify
    )


def patch_sdk(result=None, side_effect=None):
    """Stand in for the official client, which we construct per verification."""
    client = Mock()
    client.verify_captcha_response = Mock(return_value=result, side_effect=side_effect)
    return patch.object(captcha, "FriendlyCaptchaClient", return_value=client), client


# The endpoints under test carry a 2/s per-IP throttle whose cache outlives an
# individual test method. Handing every request in this module its own client IP
# keeps that throttle from turning into 429s that mask the behaviour being tested.
_client_ips = itertools.count(1)


def fresh_client_meta():
    return {"REMOTE_ADDR": f"10.{next(_client_ips)}.0.1"}


class CaptchaPassTest(TestCase):
    def test_freshly_issued_pass_is_valid(self):
        self.assertTrue(captcha.pass_is_valid(captcha.issue_pass()))

    def test_pass_older_than_ttl_is_invalid(self):
        issued = captcha.issue_pass()
        with patch.object(captcha, "PASS_TTL_SECONDS", 0):
            time.sleep(0.01)
            self.assertFalse(captcha.pass_is_valid(issued))

    def test_tampered_pass_is_invalid(self):
        issued = captcha.issue_pass()
        self.assertFalse(captcha.pass_is_valid(issued[:-1] + "x"))

    def test_empty_pass_is_invalid(self):
        self.assertFalse(captcha.pass_is_valid(""))

    def test_pass_signed_for_another_purpose_is_invalid(self):
        """A signature from elsewhere in Django must not unlock /segment."""
        from django.core.signing import TimestampSigner

        foreign = TimestampSigner(salt="some-other-purpose").sign("nonce")
        self.assertFalse(captcha.pass_is_valid(foreign))

    def test_each_pass_is_distinct(self):
        self.assertNotEqual(captcha.issue_pass(), captcha.issue_pass())


@override_settings(
    FRIENDLY_CAPTCHA_API_KEY="test-key",
    FRIENDLY_CAPTCHA_SITEKEY="FCTEST",
    FRIENDLY_CAPTCHA_ENDPOINT="global",
)
class VerifySolutionTest(TestCase):
    """
    Verification is delegated to the official Friendly Captcha SDK. What stays
    ours is the three-way verdict: the SDK reports "did it verify" and "should
    you accept" as two booleans, and callers here need to tell an outage apart
    from a genuine rejection.
    """

    def test_verified_and_accepted(self):
        patcher, _ = patch_sdk(sdk_result(should_accept=True, was_able_to_verify=True))
        with patcher:
            self.assertIs(captcha.verify_solution("a-solution"), Verdict.ACCEPTED)

    def test_verified_and_refused(self):
        patcher, _ = patch_sdk(sdk_result(should_accept=False, was_able_to_verify=True))
        with patcher:
            self.assertIs(captcha.verify_solution("a-solution"), Verdict.REJECTED)

    def test_could_not_verify_is_unavailable_not_rejected(self):
        """The SDK's non-strict mode says 'accept' here; we still must not call it a pass."""
        patcher, _ = patch_sdk(sdk_result(should_accept=True, was_able_to_verify=False))
        with patcher:
            with self.assertLogs(captcha.logger, "ERROR"):
                self.assertIs(captcha.verify_solution("a-solution"), Verdict.UNAVAILABLE)

    def test_transport_failure_is_unavailable(self):
        """The SDK lets requests exceptions escape, so an outage must be caught here."""
        patcher, _ = patch_sdk(side_effect=requests.RequestException("boom"))
        with patcher:
            with self.assertLogs(captcha.logger, "ERROR"):
                self.assertIs(captcha.verify_solution("a-solution"), Verdict.UNAVAILABLE)

    def test_empty_solution_is_rejected_without_calling_friendly_captcha(self):
        patcher, client = patch_sdk(sdk_result(True, True))
        with patcher:
            self.assertIs(captcha.verify_solution(""), Verdict.REJECTED)
        client.verify_captcha_response.assert_not_called()

    def test_missing_api_key_is_unavailable_without_calling_friendly_captcha(self):
        patcher, client = patch_sdk(sdk_result(True, True))
        with override_settings(FRIENDLY_CAPTCHA_API_KEY=""):
            with patcher:
                with self.assertLogs(captcha.logger, "ERROR"):
                    self.assertIs(
                        captcha.verify_solution("a-solution"), Verdict.UNAVAILABLE
                    )
        client.verify_captcha_response.assert_not_called()

    def test_client_is_built_from_configured_credentials(self):
        patcher, _ = patch_sdk(sdk_result(True, True))
        with patcher as constructor:
            captcha.verify_solution("a-solution")

        _, kwargs = constructor.call_args
        self.assertEqual(kwargs["api_key"], "test-key")
        self.assertEqual(kwargs["sitekey"], "FCTEST")
        self.assertEqual(kwargs["api_endpoint"], "global")

    def test_our_timeout_overrides_the_sdk_default(self):
        """The SDK defaults to 10s; too long to hold a request thread on our host."""
        patcher, client = patch_sdk(sdk_result(True, True))
        with patcher:
            captcha.verify_solution("a-solution")

        _, kwargs = client.verify_captcha_response.call_args
        self.assertEqual(kwargs["timeout"], captcha.VERIFY_TIMEOUT_SECONDS)
        self.assertLess(kwargs["timeout"], 10)


@override_settings(
    FRIENDLY_CAPTCHA_ENABLED=True,
    FRIENDLY_CAPTCHA_API_KEY="test-key",
    FRIENDLY_CAPTCHA_SITEKEY="FCTEST",
)
class CaptchaVerifyEndpointTest(TestCase):
    def setUp(self):
        from ninja.testing import TestClient
        from mandoBot.api import api

        api.urls_namespace = api.urls_namespace + "1"
        self.client = TestClient(api)

    def post_solution(self, verdict):
        with patch.object(captcha, "verify_solution", return_value=verdict):
            return self.client.post(
                "/captcha/verify",
                json={"solution": "a-solution"},
                META=fresh_client_meta(),
            )

    def test_accepted_solution_returns_a_usable_pass(self):
        response = self.post_solution(Verdict.ACCEPTED)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(captcha.pass_is_valid(response.data["captcha_pass"]))
        self.assertEqual(response.data["expires_in"], captcha.PASS_TTL_SECONDS)

    def test_rejected_solution_returns_403_and_no_pass(self):
        response = self.post_solution(Verdict.REJECTED)

        self.assertEqual(response.status_code, 403)
        self.assertNotIn("captcha_pass", response.data)

    def test_unavailable_friendly_captcha_still_returns_a_pass(self):
        """Fail open: their outage must not become ours."""
        response = self.post_solution(Verdict.UNAVAILABLE)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(captcha.pass_is_valid(response.data["captcha_pass"]))

    @override_settings(FRIENDLY_CAPTCHA_ENABLED=False)
    def test_disabled_returns_a_pass_without_contacting_friendly_captcha(self):
        with patch.object(captcha, "verify_solution") as verify:
            response = self.client.post(
                "/captcha/verify", json={"solution": ""}, META=fresh_client_meta()
            )

        self.assertEqual(response.status_code, 200)
        verify.assert_not_called()


@override_settings(
    FRIENDLY_CAPTCHA_ENABLED=True,
    FRIENDLY_CAPTCHA_API_KEY="test-key",
    FRIENDLY_CAPTCHA_SITEKEY="FCTEST",
)
class SegmentCaptchaGuardTest(TestCase):
    def setUp(self):
        from ninja.testing import TestClient
        from mandoBot.api import api

        api.urls_namespace = api.urls_namespace + "2"
        self.client = TestClient(api)

    def segment(self, **params):
        params.setdefault("META", fresh_client_meta())
        return self.client.post("/segment?data=", **params)

    def test_anonymous_request_without_a_pass_is_refused(self):
        response = self.segment()
        self.assertEqual(response.status_code, 428)

    def test_anonymous_request_with_a_valid_pass_is_served(self):
        response = self.segment(headers={"X-Captcha-Pass": captcha.issue_pass()})
        self.assertEqual(response.status_code, 200)

    def test_forged_pass_is_refused(self):
        response = self.segment(headers={"X-Captcha-Pass": "not-a-real-pass"})
        self.assertEqual(response.status_code, 428)

    def test_expired_pass_is_refused(self):
        issued = captcha.issue_pass()
        with patch.object(captcha, "PASS_TTL_SECONDS", 0):
            time.sleep(0.01)
            response = self.segment(headers={"X-Captcha-Pass": issued})
        self.assertEqual(response.status_code, 428)

    def test_authenticated_user_needs_no_pass(self):
        subscriber = Mock(pk=1, is_authenticated=True, is_staff=False, is_superuser=False)
        response = self.segment(user=subscriber)
        self.assertEqual(response.status_code, 200)

    @override_settings(FRIENDLY_CAPTCHA_ENABLED=False)
    def test_guard_is_inert_when_disabled(self):
        self.assertEqual(self.segment().status_code, 200)
