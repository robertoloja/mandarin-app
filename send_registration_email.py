import os
import django
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()

from accounts.models import PaidButUnregistered, ResetPasswordRequest  # noqa: E402
from django.core.mail import send_mail  # noqa: E402

BASE_URL = "https://mandobot.netlify.app"
MANDOBOT_EMAIL = "mandoBot <mandobotserver@gmail.com>"


def send_email(registration: PaidButUnregistered):
    subject = "MandoBot Registration Link"
    registration_link = (
        f"{BASE_URL}/auth/register?register_id={registration.registration_id}"
    )

    message = f"""
Thank you for supporting the MandoBot project!

Please complete your registration by creating a user account here: {registration_link}.

This e-mail was automatically generated, but this e-mail address is monitored by real people. If you would like
to get in touch with the developer, just reply to this e-mail.

Best regards,
mandoBot
"""
    send_mail(
        subject,
        message,
        MANDOBOT_EMAIL,
        [registration.user_email],
        False,
    )
    registration.emailed = True
    registration.save()
    return


def send_password_reset_email(email: ResetPasswordRequest):
    subject = "MandoBot password reset"
    reset_link = f"{BASE_URL}/auth/password_reset?token={email.reset_token}"
    message = f"""
Somebody has requested a password reset for the mandoBot account associated with this e-mail address.
If this was not you, feel free to ignore this e-mail. Otherwise, click on the link below:

{reset_link}

This link expires in 24 hours.

Best regards,
mandoBot
"""

    send_mail(
        subject,
        message,
        MANDOBOT_EMAIL,
        [email.user.email],
        False,
    )
    email.emailed = True
    email.save()
    return


def loop():
    while True:
        send_emails = PaidButUnregistered.objects.filter(
            emailed=False, registered=False
        )

        for registration in send_emails:
            send_email(registration)
            time.sleep(10)

        reset_passwords = ResetPasswordRequest.objects.filter(emailed=False)

        for email in reset_passwords:
            send_password_reset_email(email)
            time.sleep(10)
        time.sleep(60)


if __name__ == "__main__":
    loop()
