from enum import Enum
from django.contrib.auth.models import AbstractUser
from django.db import models


class PronunciationPreference(Enum):
    PINYIN = "pinyin"
    ZHUYIN = "zhuyin"


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
        default=PronunciationPreference.PINYIN.value,
    )

    theme_preference = models.IntegerField(
        choices=THEME,
        default=1,
    )
