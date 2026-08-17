"""
The account forms are one-shot submissions, so each carries its own single-use
Friendly Captcha solution rather than the timed pass used by /segment.
"""

import itertools
from unittest.mock import patch

from django.test import TestCase, override_settings
from ninja.testing import TestClient

from accounts.api import router
from accounts.models import MandoBotUser, PaidButUnregistered
from mandoBot import captcha
from mandoBot.captcha import Verdict

_client_ips = itertools.count(1)


def fresh_client_meta():
    return {"REMOTE_ADDR": f"10.{next(_client_ips)}.0.1"}


@override_settings(
    FRIENDLY_CAPTCHA_ENABLED=True,
    FRIENDLY_CAPTCHA_API_KEY="test-key",
    FRIENDLY_CAPTCHA_SITEKEY="FCTEST",
)
class AccountCaptchaGateTest(TestCase):
    def setUp(self):
        self.client = TestClient(router)
        MandoBotUser.objects.create_user(
            username="tester", email="tester@example.com", password="a-good-password-42"
        )

    def post(self, path, verdict, **fields):
        # django.contrib.auth.login needs a real session, which ninja's mock
        # request has no way to provide. Session handling is not what these
        # tests are about, so it is stubbed out.
        with patch("accounts.api.login"):
            with patch.object(captcha, "verify_solution", return_value=verdict) as verify:
                response = self.client.post(
                    path, data={**fields}, META=fresh_client_meta()
                )
        return response, verify

    # --- login -----------------------------------------------------------

    def test_login_with_rejected_captcha_is_refused(self):
        response, _ = self.post(
            "/login",
            Verdict.REJECTED,
            username="tester",
            password="a-good-password-42",
            captcha_solution="bad",
        )
        self.assertEqual(response.status_code, 403)

    def test_rejected_captcha_blocks_login_before_credentials_are_checked(self):
        """A bot must not learn whether a password was right by watching the error."""
        with patch("accounts.api.authenticate") as authenticate:
            self.post(
                "/login",
                Verdict.REJECTED,
                username="tester",
                password="a-good-password-42",
                captcha_solution="bad",
            )
        authenticate.assert_not_called()

    def test_login_proceeds_when_captcha_accepted(self):
        response, _ = self.post(
            "/login",
            Verdict.ACCEPTED,
            username="tester",
            password="a-good-password-42",
            captcha_solution="good",
        )
        self.assertNotEqual(response.status_code, 403)

    def test_login_proceeds_when_friendly_captcha_is_unavailable(self):
        """Fail open, consistently with /segment."""
        response, _ = self.post(
            "/login",
            Verdict.UNAVAILABLE,
            username="tester",
            password="a-good-password-42",
            captcha_solution="whatever",
        )
        self.assertNotEqual(response.status_code, 403)

    # --- password reset request ------------------------------------------

    def test_reset_request_with_rejected_captcha_sends_no_mail(self):
        """This endpoint mails any address given, so it must not run on a bad solution."""
        with patch("accounts.api.ResetPasswordRequest") as reset_request:
            response, _ = self.post(
                "/reset_password_request",
                Verdict.REJECTED,
                username="tester@example.com",
                captcha_solution="bad",
            )
        self.assertEqual(response.status_code, 403)
        reset_request.assert_not_called()

    def test_reset_request_proceeds_when_captcha_accepted(self):
        response, _ = self.post(
            "/reset_password_request",
            Verdict.ACCEPTED,
            username="tester@example.com",
            captcha_solution="good",
        )
        self.assertEqual(response.status_code, 200)

    # --- registration ----------------------------------------------------

    def test_register_with_rejected_captcha_creates_no_user(self):
        PaidButUnregistered.objects.create(user_email="new@example.com")
        with patch.object(captcha, "verify_solution", return_value=Verdict.REJECTED):
            response = self.client.post(
                "/register",
                data={
                    "username": "newcomer",
                    "email": "new@example.com",
                    "password": "another-good-password-42",
                    "captcha_solution": "bad",
                },
                META=fresh_client_meta(),
            )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(MandoBotUser.objects.filter(username="newcomer").exists())

    # --- master switch ---------------------------------------------------

    @override_settings(FRIENDLY_CAPTCHA_ENABLED=False)
    def test_disabled_lets_a_solutionless_login_through(self):
        with patch("accounts.api.login"), patch.object(
            captcha, "verify_solution"
        ) as verify:
            response = self.client.post(
                "/login",
                data={"username": "tester", "password": "a-good-password-42"},
                META=fresh_client_meta(),
            )

        verify.assert_not_called()
        self.assertNotEqual(response.status_code, 403)
