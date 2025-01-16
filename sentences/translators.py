import os
import time

import argostranslate.package
import argostranslate.translate
from django.db import OperationalError
from dragonmapper import hanzi
import deepl

from status.models import ServerStatus


class TranslatorManager:
    # Ping the DeepL api to see about usage quotas before each translation. If the quota is exceeded,
    # switch to Azure. If THAT quota is exceeded, thank god: this is a great problem to have.
    pass


translator = deepl.Translator(os.getenv("DEEPL_API_KEY"))


class DeepLTranslate:
    async def updateStatus(usage, status: ServerStatus):
        for _ in range(5):  # retry write 5 times
            try:
                status.translation_backend = "deepl"
                status.deepl_character_limit = 500000
                status.deepl_character_count = usage.character.count
                status.save()
            except OperationalError:
                time.sleep(1)

    @staticmethod
    def translate(sentence: str) -> str:
        usage = translator.get_usage()
        status = ServerStatus.objects.last()
        DeepLTranslate.updateStatus(usage, status)

        if (
            status.difference < len(sentence)
            or usage.any_limit_reached
            or usage.any_limit_exceeded
        ):
            return ArgosTranslate.translate(sentence)

        return translator.translate_text(
            sentence, source_lang="ZH", target_lang="EN-US"
        ).text


# Download and install Argos Translate package. Only runs on server bootup.
english_code = "en"
traditional_mandarin_code = "zt"
simplified_mandarin_code = "zh"

argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()
traditional_mandarin = next(
    filter(
        lambda x: x.from_code == traditional_mandarin_code
        and x.to_code == english_code,
        available_packages,
    )
)

simplified_mandarin = next(
    filter(
        lambda x: x.from_code == simplified_mandarin_code and x.to_code == english_code,
        available_packages,
    )
)

argostranslate.package.install_from_path(traditional_mandarin.download())
argostranslate.package.install_from_path(simplified_mandarin.download())


class ArgosTranslate:
    async def update_server_status(status: ServerStatus):
        for _ in range(5):  # retry write 5 times
            try:
                status.translation_backend = "argos"
                status.save()
            except OperationalError:
                time.sleep(1)

    @staticmethod
    def translate(sentence: str) -> str:
        status = ServerStatus.objects.last()
        ArgosTranslate.update_server_status(status)
        from_code = simplified_mandarin_code

        if hanzi.is_traditional(sentence):
            from_code = traditional_mandarin_code

        return argostranslate.translate.translate(sentence, from_code, english_code)


DefaultTranslator = ArgosTranslate
