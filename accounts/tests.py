import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from datetime import datetime, date, timedelta, timezone  # noqa: E402
import json  # noqa: E402
from django.test.client import Client  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402
from django.test import TestCase  # noqa: E402
from ninja.testing import TestClient  # noqa: E402
from mandoBot.api import api  # noqa: E402
from accounts.models import PaidButUnregistered  # noqa: E402


class AccountAPITests(TestCase):
    def setUp(self):
        api.urls_namespace = api.urls_namespace + "1"  # new namespace for each test
        self.client = TestClient(api)

        self.username = "test"
        self.password = "password123"
        self.email = "test@test.com"

        self.User = get_user_model()
        self.test_user = self.User.objects.create_user(
            self.username, self.email, self.password
        )

    def tearDown(self):
        self.client = None

    def test_inactive_user_becomes_active_on_payment(self):
        # 1 - Set user to inactive
        self.test_user.last_payment = date.today() - timedelta(days=60)
        self.test_user.save()
        self.assertFalse(self.test_user.subscription_is_active())

        # 2 - Send payment to /kofi
        response = Client().post(
            "/api/accounts/kofi",
            {"data": self.kofi_data(first_subscription=False, email=self.email)},
        )
        self.assertEqual(response.status_code, 200)

        # 3 - Login
        response = Client().post(
            "/api/accounts/login",
            {"username": self.username, "password": self.password},
        )
        expected = {
            "username": self.username,
            "email": self.email,
            "pronunciation_preference": "pinyin_acc",
            "theme_preference": 1,
        }
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)
        self.assertTrue(  # have to fetch the user again
            self.User.objects.get(email=self.email).subscription_is_active()
        )

    def test_cannot_register_without_kofi_subscription(self):
        response = Client().post(
            "/api/accounts/register",
            {"username": "user", "password": "pass", "email": "email"},
        )
        self.assertEqual(response.status_code, 404)

    def test_first_payment_creates_registration_link(self):
        username = "foo"
        password = "password"
        email = "some@email.net"
        response = Client().post(
            "/api/accounts/kofi",
            {"data": self.kofi_data(first_subscription=True, email=email)},
        )
        link = PaidButUnregistered.objects.get(user_email=email)
        expected = {"message": "Sent registration e-mail"}
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)
        self.assertEqual(link.user_email, email)
        self.assertFalse(link.registered)

        registration_response = Client().post(
            "/api/accounts/register",
            {"username": username, "password": password, "email": email},
        )
        self.assertEqual(registration_response.status_code, 200)
        User = get_user_model()
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
            "theme_preference": 1,
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
        User = get_user_model()
        user = User.objects.create_user(
            username="will", email="will@email.com", password="testpass123"
        )
        self.assertEqual(user.username, "will")
        self.assertEqual(user.email, "will@email.com")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        User = get_user_model()
        admin_user = User.objects.create_superuser(
            username="superadmin", email="superadmin@email.com", password="testpass123"
        )
        self.assertEqual(admin_user.username, "superadmin")
        self.assertEqual(admin_user.email, "superadmin@email.com")
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

    def test_subscription_is_active(self):
        User = get_user_model()
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
