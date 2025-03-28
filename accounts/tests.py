import os
import django
from datetime import datetime, date, timedelta, timezone
import json
from typing import TYPE_CHECKING

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from django.test.client import Client  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402
from django.contrib.auth.hashers import check_password  # noqa: E402
from django.test import TestCase  # noqa: E402
from ninja.testing import TestClient  # noqa: E402

from mandoBot.api import api  # noqa: E402
from accounts.models import (  # noqa: E402
    PaidButUnregistered,
    ResetPasswordRequest,
    MandoBotUser,
)

if TYPE_CHECKING:
    User: type[MandoBotUser]
else:
    User = get_user_model()


class AccountAPITests(TestCase):
    def setUp(self):
        os.environ["TEST"] = "True"
        api.urls_namespace = api.urls_namespace + "1"  # new namespace for each test
        self.client: TestClient = TestClient(api)

        self.username = "test"
        self.password = "password123"
        self.email = "test@test.com"

        self.test_user = User.objects.create_user(
            self.username, self.email, self.password
        )

    def tearDown(self):
        os.environ.pop("TEST", None)

    def test_password_reset(self):
        client = Client()

        # nonexistent username will not create a ResetPasswordReset
        response = client.post(
            "/api/accounts/reset_password_request", {"username": "whoever"}
        )
        self.assertEqual(response.status_code, 200)

        with self.assertRaises(ResetPasswordRequest.DoesNotExist):
            ResetPasswordRequest.objects.get()

        response = client.post(
            "/api/accounts/reset_password_request", {"username": self.username}
        )
        self.assertEqual(response.status_code, 200)
        entry = ResetPasswordRequest.objects.get(user=self.test_user)
        new_password = "foo123bar"

        response = client.post(
            "/api/accounts/reset_password",
            {
                "reset_token": entry.reset_token,
                "new_password": new_password,
                "confirmation": new_password,
            },
        )
        self.assertEqual(response.status_code, 200)

        updated_user = User.objects.get(email=self.email)
        self.assertTrue(check_password(new_password, updated_user.password))

        # Link can't be used again
        response = client.post(
            "/api/accounts/reset_password",
            {
                "reset_token": entry.reset_token,
                "new_password": new_password,
                "confirmation": new_password,
            },
        )
        self.assertTrue(response.status_code, 404)

    def test_change_password(self):
        client = Client()
        response = client.post(
            "/api/accounts/login",
            {"username": self.username, "password": self.password},
        )
        self.assertEqual(200, response.status_code)

        response = client.post(
            "/api/accounts/change_password",
            {
                "username": self.username,
                "password": "1234556abcde",
                "new_password": "1234",
                "password_confirmation": "5678",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertListEqual(
            json.loads(response.content)["error"],
            [
                "Current password incorrect",
                "New password does not match password confirmation",
                "This password is too short. It must contain at least 8 characters.",
                "This password is too common.",
                "This password is entirely numeric.",
            ],
        )

        new_password = "PrettyGoodPassw0rd?"
        response = client.post(
            "/api/accounts/change_password",
            {
                "username": self.username,
                "password": self.password,
                "new_password": new_password,
                "password_confirmation": new_password,
            },
        )
        self.assertEqual(response.status_code, 200)
        user = User.objects.get(email=self.email)
        self.assertTrue(check_password(new_password, user.password))

    def test_short_password_returns_error(self):
        client = Client()
        response = client.post(
            "/api/accounts/register",
            {"username": self.username, "password": "1234", "email": self.email},
        )
        self.assertEqual(response.status_code, 400)

    def test_inactive_user_becomes_active_on_payment(self):
        # 1 - Set user to inactive
        self.test_user.last_payment = date.today() - timedelta(days=60)
        self.test_user.save()
        self.assertFalse(self.test_user.subscription_is_active())

        # 2 - Send payment to /kofi
        client = Client()
        response = client.post(
            "/api/accounts/kofi",
            {"data": self.kofi_data(first_subscription=False, email=self.email)},
        )
        self.assertEqual(response.status_code, 200)

        # 3 - Login
        response = client.post(
            "/api/accounts/login",
            {"username": self.username, "password": self.password},
        )
        expected = {
            "username": self.username,
            "email": self.email,
            "pronunciation_preference": "pinyin_acc",
            "theme_preference": 0,
        }
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)
        self.assertTrue(  # have to fetch the user again
            User.objects.get(email=self.email).subscription_is_active()
        )

    def test_cannot_register_without_kofi_subscription(self):
        response = Client().post(
            "/api/accounts/register",
            {
                "username": "user",
                "password": "aReallyGoodPassword",
                "email": "email",
            },
        )
        self.assertEqual(response.status_code, 404)

    def test_first_payment_creates_registration_link(self):
        client = Client()
        username = "foo"
        password = "AreallyGOODpassword"
        email = "some@email.net"
        response = client.post(
            "/api/accounts/kofi",
            {"data": self.kofi_data(first_subscription=True, email=email)},
        )
        link = PaidButUnregistered.objects.get(user_email=email)
        expected = {"message": "Sent registration e-mail"}
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)
        self.assertEqual(link.user_email, email)
        self.assertFalse(link.registered)

        registration_response = client.post(
            "/api/accounts/register",
            {"username": username, "password": password, "email": email},
        )
        self.assertEqual(registration_response.status_code, 201)
        test_user = User.objects.get(email=email)
        self.assertEqual(test_user.email, email)

    def test_inactive_user_gets_error(self):
        forty_days_ago = date.today() - timedelta(days=40)
        self.test_user.last_payment = forty_days_ago
        self.test_user.save()

        response = self.client.post(
            "/accounts/login",
            {
                "username": self.username,
                "password": self.password,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data, {"error": "Subscription has expired"})

    def test_active_user_can_login(self):
        self.test_user.last_payment = date.today() - timedelta(days=1)
        self.test_user.save()
        response = Client().post(  # Django-Ninja's TestClient has no session info
            "/api/accounts/login",
            {"username": self.username, "password": self.password},
        )
        expected = {
            "username": self.username,
            "email": self.email,
            "pronunciation_preference": "pinyin_acc",
            "theme_preference": 0,
        }
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)

    def kofi_data(self, first_subscription: bool, email: str):
        now = datetime.now(timezone.utc)
        date_string = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        return json.dumps(
            {
                "verification_token": "40d23770-f85d-4c4e-aab3-8e882dc342fb",
                "message_id": "5bb41b61-ed31-4def-aa5e-f06131b802db",
                "timestamp": date_string,
                "type": "Subscription",
                "is_public": True,
                "from_name": "Jo Example",
                "message": "Good luck with the integration!",
                "amount": "3.00",
                "url": "https://ko-fi.com/Home/CoffeeShop?txid=00000000-1111-2222-3333-444444444444",
                "email": email,
                "currency": "USD",
                "is_subscription_payment": True,
                "is_first_subscription_payment": first_subscription,
                "kofi_transaction_id": "00000000-1111-2222-3333-444444444444",
                "shop_items": True,
                "tier_name": True,
                "shipping": True,
            }
        )


class MandoBotUserTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username="will", email="will@email.com", password="testpass123"
        )
        self.assertEqual(user.username, "will")
        self.assertEqual(user.email, "will@email.com")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(
            username="superadmin", email="superadmin@email.com", password="testpass123"
        )
        self.assertEqual(admin_user.username, "superadmin")
        self.assertEqual(admin_user.email, "superadmin@email.com")
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

    def test_subscription_is_active(self):
        user = User.objects.create_user(
            username="Test", email="test@test.com", password="test123"
        )
        forty_days_ago = date.today() - timedelta(days=40)
        user.last_payment = forty_days_ago
        user.save()
        self.assertFalse(user.subscription_is_active())
        self.assertFalse(user.subscription_active)

        user.last_payment = date.today() - timedelta(days=34)
        user.save()
        self.assertTrue(user.subscription_is_active())
        self.assertTrue(user.subscription_active)
