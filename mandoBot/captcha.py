"""
Friendly Captcha integration.

Two independent pieces live here:

1. ``verify_solution`` - the only code in the project that talks to
   Friendly Captcha. It turns a widget solution into a three-way verdict.
2. ``issue_pass`` / ``pass_is_valid`` - a stateless, time-boxed pass that
   lets an anonymous client make many ``/segment`` calls after solving the
   captcha once. Signed with Django's ``TimestampSigner``, so it needs no
   database row and no session.
"""

import logging
import secrets
from enum import Enum

import requests
from django.conf import settings
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from friendly_captcha_client.client import FriendlyCaptchaClient

logger = logging.getLogger(__name__)

PASS_SALT = "mandoBot.captcha.pass"
PASS_TTL_SECONDS = 30 * 60

# The SDK defaults to 10s, which is a long time to hold a request thread on a
# small host. Every verification passes this explicitly.
VERIFY_TIMEOUT_SECONDS = 3


class Verdict(Enum):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    UNAVAILABLE = "unavailable"


def verify_solution(solution: str) -> Verdict:
    """
    Ask Friendly Captcha whether ``solution`` is a genuine, unused proof of work.

    The official SDK does the talking and owns the error-code table. It reports
    two booleans - ``was_able_to_verify`` and ``should_accept`` - which collapse
    an outage and a genuine rejection into the same "accept" answer under its
    default non-strict mode. Callers here need those cases apart, so they are
    widened back into a three-way verdict.

    Returns UNAVAILABLE rather than REJECTED whenever the failure is on our side,
    so callers can decide to fail open without also waving through bad solutions.
    """
    if not solution:
        return Verdict.REJECTED

    if not settings.FRIENDLY_CAPTCHA_API_KEY:
        logger.error("Friendly Captcha is enabled but FRIENDLY_CAPTCHA_API_KEY is unset")
        return Verdict.UNAVAILABLE

    client = FriendlyCaptchaClient(
        api_key=settings.FRIENDLY_CAPTCHA_API_KEY,
        sitekey=settings.FRIENDLY_CAPTCHA_SITEKEY,
        api_endpoint=settings.FRIENDLY_CAPTCHA_ENDPOINT,
    )

    try:
        result = client.verify_captcha_response(
            solution, timeout=VERIFY_TIMEOUT_SECONDS
        )
    except requests.RequestException as error:
        # The SDK does not wrap its own HTTP call, so a connection error or
        # timeout escapes as an exception. Left uncaught it would become a 500,
        # which fails closed - the opposite of what its non-strict mode promises.
        logger.error("Friendly Captcha unreachable: %s", error)
        return Verdict.UNAVAILABLE

    if not result.was_able_to_verify:
        logger.error(
            "Friendly Captcha could not verify the solution (error: %s)", result.error
        )
        return Verdict.UNAVAILABLE

    return Verdict.ACCEPTED if result.should_accept else Verdict.REJECTED


def _signer() -> TimestampSigner:
    return TimestampSigner(salt=PASS_SALT)


def solution_is_refused(solution: str) -> bool:
    """
    The single place the fail-open policy lives: a solution blocks a request only
    when Friendly Captcha positively rejects it. An outage or a misconfiguration
    on our side lets the caller through.
    """
    if not settings.FRIENDLY_CAPTCHA_ENABLED:
        return False
    return verify_solution(solution) is Verdict.REJECTED


PASS_HEADER = "X-Captcha-Pass"


def request_needs_pass(request) -> bool:
    """
    Only anonymous callers are gated, and only when the feature is switched on.
    Subscribers already cost money to become, so they skip the captcha entirely.
    """
    if not settings.FRIENDLY_CAPTCHA_ENABLED:
        return False
    return not request.user.is_authenticated


def request_has_valid_pass(request) -> bool:
    return pass_is_valid(request.headers.get(PASS_HEADER, ""))


def issue_pass() -> str:
    """Mint a signed, time-stamped pass. Each one is distinct."""
    return _signer().sign(secrets.token_urlsafe(16))


def pass_is_valid(value: str) -> bool:
    """True only for an untampered pass minted here within the TTL."""
    if not value:
        return False
    try:
        _signer().unsign(value, max_age=PASS_TTL_SECONDS)
    except (BadSignature, SignatureExpired):
        return False
    return True
