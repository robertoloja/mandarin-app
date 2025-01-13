from django.apps import AppConfig


class SentencesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "sentences"

    def ready(self):
        super().ready()

        # Initialize segmenter and translator
        from .segmenters import DefaultSegmenter
        from .translators import DefaultTranslator

        DefaultTranslator.translate("好的")
        DefaultSegmenter.segment("好安")

        # Reset average response time
        from status.models import ServerStatus

        server_status, _ = ServerStatus.objects.get_or_create()
        server_status.mandobot_response_time = 10000
        server_status.save()
