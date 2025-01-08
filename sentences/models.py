import json
import secrets
from django.db import models
from django.core.exceptions import ValidationError
from .validators import is_simplified, is_traditional, is_pinyin
from accounts.models import MandoBotUser


class NormalizedJSONManager(models.Manager):
    def filter(self, *args, **kwargs):
        if "json_data" in kwargs:
            kwargs["json_data"] = SentenceHistory.normalize_json(kwargs["json_data"])
        return super().filter(*args, **kwargs)

    def get_or_create(self, *args, **kwargs):
        if "json_data" in kwargs:
            kwargs["json_data"] = SentenceHistory.normalize_json(kwargs["json_data"])
        return super().get_or_create(*args, **kwargs)

    def get(self, *args, **kwargs):
        if "json_data" in kwargs:
            kwargs["json_data"] = SentenceHistory.normalize_json(kwargs["json_data"])
        return super().get(*args, **kwargs)

    def aget_or_create(self, *args, **kwargs):
        if "json_data" in kwargs:
            kwargs["json_data"] = SentenceHistory.normalize_json(kwargs["json_data"])
        return super().aget_or_create(*args, **kwargs)

    def aget(self, *args, **kwargs):
        if "json_data" in kwargs:
            kwargs["json_data"] = SentenceHistory.normalize_json(kwargs["json_data"])
        return super().aget(*args, **kwargs)


class SentenceHistory(models.Model):
    sentence_id = models.CharField(max_length=10, unique=True, db_index=True)
    json_data = models.JSONField(unique=True)
    user = models.ForeignKey(
        MandoBotUser, on_delete=models.CASCADE, related_name="history"
    )

    objects = NormalizedJSONManager()

    def __str__(self, **kwargs):
        return f"{self.sentence_id}"

    def save(self, *args, **kwargs):
        self.sentence_id = secrets.token_urlsafe(10)[:10]

        # Normalize JSON before saving
        if isinstance(self.json_data, dict):
            self.json_data = self.normalize_json(self.json_data)
        super().save(*args, **kwargs)

    def clean(self):
        if not isinstance(self.json_data, str):
            raise ValidationError("json_data must be a string")
        try:
            json.loads(self.json_data)
        except ValueError:
            raise ValidationError("Invalid JSON format")

    @staticmethod
    def normalize_json(json_obj):
        return json.dumps(json_obj, sort_keys=True)


class CEDictionary(models.Model):
    traditional: str = models.CharField(
        max_length=50, validators=[is_traditional], db_index=True
    )
    simplified: str = models.CharField(
        max_length=50, validators=[is_simplified], db_index=True
    )
    word_length: int = models.PositiveIntegerField(editable=False)
    pronunciation: str = models.TextField(validators=[is_pinyin])
    definitions: str = models.TextField()
    hanzi = models.ManyToManyField(
        "self",
        through="ConstituentHanzi",
        through_fields=("word", "hanzi"),
        related_name="is_in",
        symmetrical=False,
    )

    def get_hanzi(self):
        """
        Returns an ordered QuerySet of the CEDictionary objects corresponding
        the hanzi in the CEDictionary object being manipulated.
        """
        return [
            constituent.hanzi for constituent in self.word_hanzi.select_related("hanzi")
        ]

    class Meta:
        unique_together = (
            "traditional",
            "simplified",
            "word_length",
            "pronunciation",
            "definitions",
        )

    def save(self, **kwargs):
        self.word_length = len(self.traditional)
        self.definitions = " / ".join(self.definitions)
        super().save()

    def __str__(self):
        return f"{self.traditional}/{self.simplified} [{self.pronunciation}]"


class ConstituentHanzi(models.Model):
    word = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="word_hanzi"
    )
    hanzi = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="hanzi_word"
    )
    order = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ["order"]
        unique_together = ("word", "hanzi", "order")

    def __str__(self):
        return f"{self.hanzi.traditional} in {self.word.traditional}[{self.order}]"
