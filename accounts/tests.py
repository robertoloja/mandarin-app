import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from django.test import TestCase  #  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402
from datetime import date, timedelta  # noqa: E402


class CustomUserTests(TestCase):
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
