from concurrent.futures import ThreadPoolExecutor
import time

from django.db import OperationalError
import argostranslate.package
import argostranslate.translate
from dragonmapper import hanzi as hanzi_utils

from status.models import ServerStatus

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
    def update_server_status(status: ServerStatus):
        for _ in range(5):
            try:
                status.translation_backend = "argos"
                status.save()
            except OperationalError:
                time.sleep(1)

    @staticmethod
    def translate(sentence: str) -> str:
        status = ServerStatus.objects.last()

        with ThreadPoolExecutor() as executor:
            executor.submit(ArgosTranslate.update_server_status, status)

        from_code = simplified_mandarin_code

        if hanzi_utils.is_traditional(sentence):
            from_code = traditional_mandarin_code

        return argostranslate.translate.translate(sentence, from_code, english_code)
