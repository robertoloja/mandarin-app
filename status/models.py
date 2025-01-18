from django.db import models


class ServerStatus(models.Model):
    TRANSLATION_BACKEND_OPTIONS = [(0, "deepl"), (1, "argos")]

    updated_at = models.DateTimeField(auto_now=True)
    deepl_character_count = models.PositiveIntegerField(default=0)
    deepl_character_limit = models.PositiveIntegerField(default=0)
    translation_backend = models.CharField(
        max_length=10, choices=TRANSLATION_BACKEND_OPTIONS
    )

    mandobot_response_time = models.PositiveSmallIntegerField(default=10000)

    def __str__(self) -> str:
        return f"{self.translation_backend}, responding in {self.mandobot_response_time}, updated at {self.updated_at}"

    @property
    def difference(self) -> int:
        return self.deepl_character_limit - self.deepl_character_count
