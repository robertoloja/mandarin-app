from concurrent.futures import ThreadPoolExecutor
import os
import time

from django.db import OperationalError
import deepl

from status.models import ServerStatus
from sentences.translators import ArgosTranslate
from mandoBot.languages import get_language_config

translator = deepl.Translator(os.getenv("DEEPL_API_KEY"))


class DeepLTranslate:

    def updateStatus(usage, status: ServerStatus):
        for _ in range(5):
            try:
                status.translation_backend = "deepl"
                status.deepl_character_limit = 500000
                status.deepl_character_count = usage.character.count
                status.save()
            except OperationalError:
                time.sleep(1)

    @staticmethod
    def translate(sentence: str, target_language: str = 'en') -> str:
        usage = translator.get_usage()
        status = ServerStatus.objects.last()

        with ThreadPoolExecutor() as executor:
            executor.submit(DeepLTranslate.updateStatus, usage, status)

        if (
            status.difference < len(sentence)
            or usage.any_limit_reached
            or usage.any_limit_exceeded
        ):
            return ArgosTranslate.translate(sentence, target_language)

        lang_config = get_language_config(target_language)
        deepl_code = lang_config['deepl_code']
        
        return translator.translate_text(
            sentence, source_lang="ZH", target_lang=deepl_code
        ).text
