from datetime import date, timedelta
from enum import Enum
from django.contrib.auth.models import AbstractUser
from django.db import models


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
        default=1,
    )

    last_payment = models.DateField(null=True)
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
