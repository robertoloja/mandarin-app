from concurrent.futures import ThreadPoolExecutor
import time

from django.db import OperationalError
import argostranslate.package
import argostranslate.translate
from dragonmapper import hanzi as hanzi_utils

from status.models import ServerStatus
from mandoBot.languages import get_language_config

# Download and install Argos Translate package. Only runs on server bootup.
ARGOS_LANGUAGE_MAP = {
    'en': 'en',
    'de': 'de',
}

traditional_mandarin_code = "zt"
simplified_mandarin_code = "zh"

argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()

# Install packages for each supported language
for language_code, argos_code in ARGOS_LANGUAGE_MAP.items():
    try:
        # Try to install traditional -> language package
        traditional_pkg = next(
            filter(
                lambda x: x.from_code == traditional_mandarin_code
                and x.to_code == argos_code,
                available_packages,
            ),
            None
        )
        if traditional_pkg:
            argostranslate.package.install_from_path(traditional_pkg.download())
        
        # Try to install simplified -> language package
        simplified_pkg = next(
            filter(
                lambda x: x.from_code == simplified_mandarin_code
                and x.to_code == argos_code,
                available_packages,
            ),
            None
        )
        if simplified_pkg:
            argostranslate.package.install_from_path(simplified_pkg.download())
    except StopIteration:
        # Package not available, skip
        pass


class ArgosTranslate:
    def update_server_status(status: ServerStatus):
        for _ in range(5):
            try:
                status.translation_backend = "argos"
                status.save()
            except OperationalError:
                time.sleep(1)

    @staticmethod
    def translate(sentence: str, target_language: str = 'en') -> str:
        status = ServerStatus.objects.last()

        with ThreadPoolExecutor() as executor:
            executor.submit(ArgosTranslate.update_server_status, status)

        from_code = simplified_mandarin_code

        if hanzi_utils.is_traditional(sentence):
            from_code = traditional_mandarin_code

        # Get the Argos code for the target language
        to_code = ARGOS_LANGUAGE_MAP.get(target_language, ARGOS_LANGUAGE_MAP['en'])

        try:
            return argostranslate.translate.translate(sentence, from_code, to_code)
        except (AttributeError, ValueError) as e:
            # Handle case where target language package is not available
            # Fall back to English translation
            if to_code != ARGOS_LANGUAGE_MAP['en']:
                try:
                    return argostranslate.translate.translate(sentence, from_code, ARGOS_LANGUAGE_MAP['en'])
                except Exception:
                    return sentence  # Return original if translation fails
            else:
                return sentence  # Return original if English translation fails
