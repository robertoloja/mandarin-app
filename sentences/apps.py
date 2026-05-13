from concurrent.futures import ThreadPoolExecutor
from django.apps import AppConfig


class SentencesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "sentences"

    def ready(self):
        super().ready()
        with ThreadPoolExecutor() as exe:
            exe.submit(self._prepare)

    @staticmethod
    def _prepare():
        # Build (or validate) the CEDict → Jieba user dictionary before the
        # first segment call so Jieba is aware of all known vocabulary.
        from .segmenters.JiebaSegmenter import build_cedict_user_dict
        build_cedict_user_dict()

        # Warm up Jieba and Argos, and reset the rolling response-time average.
        from .segmenters import DefaultSegmenter
        DefaultSegmenter.segment("好安")

        from status.models import ServerStatus
        server_status, _ = ServerStatus.objects.get_or_create()
        server_status.mandobot_response_time = 10000
        server_status.deepl_character_limit = 500000
        server_status.deepl_character_count = 0
        server_status.save()
