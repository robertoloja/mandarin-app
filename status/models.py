from django.db import models


class ServerStatus(models.Model):
    TRANSLATION_BACKEND_OPTIONS = [(0, "deepl"), (1, "argos")]

    updated_at = models.DateTimeField(auto_now=True)
    deepl_character_count = models.PositiveIntegerField(null=True)
    deepl_character_limit = models.PositiveIntegerField(null=True)
    translation_backend = models.CharField(
        max_length=10, choices=TRANSLATION_BACKEND_OPTIONS, null=True
    )

    mandobot_response_time = models.PositiveSmallIntegerField(default=10000)

    @property
    def difference(self):
        return self.character_limit - self.character_count
