import json
import secrets
from django.db import models
from django.core.exceptions import ValidationError
from .validators import is_simplified, is_traditional, is_pinyin


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


class SentenceHistory(models.Model):
    sentence_id = models.CharField(max_length=10, unique=True, db_index=True)
    json_data = models.JSONField(unique=True)

    objects = NormalizedJSONManager()

    def __str__(self, **kwargs):
        return f"{self.sentence_id}: {self.json_data['translation']}"

    def save(self, *args, **kwargs):
        self.sentence_id = secrets.token_urlsafe(10)

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
        return json.loads(json.dumps(json_obj, sort_keys=True))


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
    constituent_hanzi = models.ManyToManyField(
        "self", symmetrical=False, through="Hanzi"
    )

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
        self.definitions = "/".join(self.definitions)
        super().save()

    def __str__(self):
        return f"{self.traditional}/{self.simplified} [{self.pronunciation}]"


class Hanzi(models.Model):
    word = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="containing_words"
    )
    hanzi = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="hanzi"
    )
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.hanzi.traditional} in {self.word.traditional} (position: {self.order})"
