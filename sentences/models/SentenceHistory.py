import json
import secrets

from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import MandoBotUser


class SentenceHistory(models.Model):
    sentence_id = models.CharField(max_length=10, unique=True, db_index=True)
    json_data = models.JSONField(unique=True)
    user = models.ForeignKey(
        MandoBotUser, on_delete=models.CASCADE, related_name="history", null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

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

    class NormalizedJSONManager(models.Manager):
        def filter(self, *args, **kwargs):
            if "json_data" in kwargs:
                kwargs["json_data"] = SentenceHistory.normalize_json(
                    kwargs["json_data"]
                )
            return super().filter(*args, **kwargs)

        def get_or_create(self, *args, **kwargs):
            if "json_data" in kwargs:
                kwargs["json_data"] = SentenceHistory.normalize_json(
                    kwargs["json_data"]
                )
            return super().get_or_create(*args, **kwargs)

        def get(self, *args, **kwargs):
            if "json_data" in kwargs:
                kwargs["json_data"] = SentenceHistory.normalize_json(
                    kwargs["json_data"]
                )
            return super().get(*args, **kwargs)

        def aget_or_create(self, *args, **kwargs):
            if "json_data" in kwargs:
                kwargs["json_data"] = SentenceHistory.normalize_json(
                    kwargs["json_data"]
                )
            return super().aget_or_create(*args, **kwargs)

        def aget(self, *args, **kwargs):
            if "json_data" in kwargs:
                kwargs["json_data"] = SentenceHistory.normalize_json(
                    kwargs["json_data"]
                )
            return super().aget(*args, **kwargs)

    objects = NormalizedJSONManager()

    @staticmethod
    def normalize_json(json_obj):
        return json.dumps(json_obj, sort_keys=True)
