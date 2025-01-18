from asyncio import get_event_loop
from concurrent.futures import ThreadPoolExecutor
from django.apps import AppConfig
from asgiref.sync import sync_to_async


class SentencesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "sentences"

    def ready(self):
        super().ready()

        # Initialize segmenter and translator

        # Reset average response time

        with ThreadPoolExecutor() as exe:
            exe.submit(self.prepare_status)

    def prepare_status():
        from .segmenters import DefaultSegmenter

        DefaultSegmenter.segment("好安")
        from status.models import ServerStatus

        server_status, _ = ServerStatus.objects.get_or_create()
        server_status.mandobot_response_time = 10000
        server_status.deepl_character_limit = 500000
        server_status.deepl_character_count = 0
        server_status.save()
