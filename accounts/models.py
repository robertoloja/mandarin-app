import secrets
from datetime import date, timedelta
from enum import Enum
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class PronunciationPreference(Enum):
    PINYIN_NUM = "pinyin_num"
    PINYIN_ACC = "pinyin_acc"
    ZHUYIN = "zhuyin"
    IPA = "ipa"


class MandoBotUser(AbstractUser):
    PRONUNCIATION = [(p.value, p.name.title()) for p in PronunciationPreference]
    THEME = [
        (0, "dark"),
        (1, "light"),
    ]
    MANDARIN_TYPE = [
        (0, "traditional"),
        (1, "simplified"),
    ]
    pronunciation_preference = models.CharField(
        max_length=10,
        choices=PRONUNCIATION,
        default=PronunciationPreference.PINYIN_ACC.value,
    )
    theme_preference = models.IntegerField(
        choices=THEME,
        default=0,
    )
    last_payment = models.DateField(default=now)
    subscription_active = models.BooleanField(default=True)

    def subscription_is_active(self) -> bool:
        thirty_five_days_ago = date.today() - timedelta(days=35)

        if self.last_payment and self.last_payment < thirty_five_days_ago:
            self.subscription_active = False
            self.save()
            return False
        else:
            self.subscription_active = True
            self.save()
            return True


class ResetPasswordRequest(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(MandoBotUser, on_delete=models.CASCADE)
    emailed = models.BooleanField(default=False)
    reset_token = models.CharField(max_length=20, unique=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.reset_token:
            self.reset_token = secrets.token_urlsafe(20)
        super().save(*args, **kwargs)

    def is_expired(self):
        return self.created_at < (date.today() - timedelta(days=1))


class PaidButUnregistered(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    registration_id = models.CharField(max_length=20, unique=True, editable=False)
    user_email = models.TextField(unique=True, editable=False)
    registered = models.BooleanField(default=False)
    emailed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.registration_id:
            self.registration_id = secrets.token_urlsafe(20)
        super().save(*args, **kwargs)
