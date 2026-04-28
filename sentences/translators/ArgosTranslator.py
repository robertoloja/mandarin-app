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

# Install zh→{lang} packages where available, and en→{lang} pivot packages
PIVOT_LANGUAGE_PAIRS = [
    (simplified_mandarin_code, 'en'),
    (traditional_mandarin_code, 'en'),
] + [
    ('en', argos_code)
    for lang_code, argos_code in ARGOS_LANGUAGE_MAP.items()
    if lang_code != 'en'
]

for from_code, to_code in PIVOT_LANGUAGE_PAIRS:
    pkg = next(
        filter(
            lambda x: x.from_code == from_code and x.to_code == to_code,
            available_packages,
        ),
        None,
    )
    if pkg:
        print(f"Installing Argos package {from_code}→{to_code}...")
        try:
            argostranslate.package.install_from_path(pkg.download())
        except Exception as e:
            print(f"Failed to install {from_code}→{to_code}: {e}")

# Also try direct zh→{lang} packages (used if available)
for language_code, argos_code in ARGOS_LANGUAGE_MAP.items():
    if argos_code == 'en':
        continue
    for zh_code in (simplified_mandarin_code, traditional_mandarin_code):
        pkg = next(
            filter(
                lambda x: x.from_code == zh_code and x.to_code == argos_code,
                available_packages,
            ),
            None,
        )
        if pkg:
            print(f"Installing Argos package {zh_code}→{argos_code}...")
            try:
                argostranslate.package.install_from_path(pkg.download())
            except Exception as e:
                print(f"Failed to install {zh_code}→{argos_code}: {e}")


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

        # Argos Translate automatically builds CompositeTranslation chains at
        # startup (e.g. zh→en→de) from installed packages, so a direct call works
        # as long as the required packages (zh→en, en→de) are installed.
        try:
            return argostranslate.translate.translate(sentence, from_code, to_code)
        except Exception:
            return sentence
