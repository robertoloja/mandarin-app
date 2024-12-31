from django.conf import settings
if settings.DEBUG:
    import argostranslate.package
    import argostranslate.translate
    from dragonmapper import hanzi
import deepl
import os

translator = deepl.Translator(os.getenv('DEEPL_API_KEY'))
class DeepLTranslate:
    @staticmethod
    def translate(sentence: str) -> str:
        return translator.translate_text(sentence, source_lang='ZH', target_lang='EN-US').text

if settings.DEBUG:
    # Download and install Argos Translate package. Only runs on server bootup. 
    english_code = "en"
    traditional_mandarin_code = "zt"
    simplified_mandarin_code = "zh"

    argostranslate.package.update_package_index()
    available_packages = argostranslate.package.get_available_packages()
    traditional_mandarin = next(filter(lambda x: x.from_code == traditional_mandarin_code and
                                            x.to_code == english_code, available_packages))

    simplified_mandarin = next(filter(lambda x: x.from_code == simplified_mandarin_code and
                                            x.to_code == english_code, available_packages))

    argostranslate.package.install_from_path(traditional_mandarin.download())
    argostranslate.package.install_from_path(simplified_mandarin.download())

    class ArgosTranslate:
        @staticmethod
        def translate(sentence: str) -> str:
            from_code = simplified_mandarin_code

            if hanzi.is_traditional(sentence):
                from_code = traditional_mandarin_code

            return argostranslate.translate.translate(sentence, 
                                                    from_code, 
                                                    english_code)

DefaultTranslator = ArgosTranslate if settings.DEBUG else DeepLTranslate
