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
