import os
import django
import time

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from accounts.models import PaidButUnregistered  # noqa: E402
from django.core.mail import send_mail  # noqa: E402


def send_email(registration: PaidButUnregistered):
    print(
        f"Send email to {registration.user_email} with link {registration.registration_id}"
    )
    subject = "MandoBot Registration Link"
    registration_link = f"https://mandobot.netlify.app/auth/register?register_id={registration.registration_id}"

    message = f"""
Thank you for supporting the MandoBot project!

Please complete your registration by creating a user account here: {registration_link}.

This e-mail was automatically generated, but this e-mail address is monitored by real people. If you would like
to get in touch with the developer, just reply to this e-mail.

Best regards,
MandoBot
"""

    send_mail(
        subject, message, "mandobotserver@gmail.com", [registration.user_email], False
    )
    registration.emailed = True
    registration.save()
    return


def loop():
    while True:
        send_emails = PaidButUnregistered.objects.filter(
            emailed=False, registered=False
        )

        for registration in send_emails:
            send_email(registration)
            time.sleep(10)

        time.sleep(60)


if __name__ == "__main__":
    loop()
