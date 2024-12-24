import argostranslate.package
import argostranslate.translate
from dragonmapper import hanzi
from multiprocessing import Manager, Lock

# Global variable to hold the initialized translator
manager = Manager()
translator_initialized = manager.Value('b', False)  # Shared boolean value
translator_lock = Lock()  # Lock to ensure thread-safe initialization
translator = None
english_code = "en"
traditional_mandarin_code = "zt"
simplified_mandarin_code = "zh"

def initialize_translator():
    global translator
    with translator_lock:  # Ensure that only one process can initialize at a time
        if not translator_initialized.value:  # Check the shared value
            print("TRANSLATOR")
            # Download and install Argos Translate package. Only runs on server bootup (AND PROCESS FORKS). 
            argostranslate.package.update_package_index()
            available_packages = argostranslate.package.get_available_packages()
            traditional_mandarin = next(filter(lambda x: x.from_code == traditional_mandarin_code and
                                                  x.to_code == english_code, available_packages))

            simplified_mandarin = next(filter(lambda x: x.from_code == simplified_mandarin_code and
                                                 x.to_code == english_code, available_packages))

            argostranslate.package.install_from_path(traditional_mandarin.download())
            argostranslate.package.install_from_path(simplified_mandarin.download())

            translator_initialized.value = True  # Set the shared value to True
            translator = ArgosTranslate()  # Initialize the translator

class ArgosTranslate:
    @staticmethod
    def translate(sentence: str) -> str:
        from_code = simplified_mandarin_code

        if hanzi.is_traditional(sentence):
            from_code = traditional_mandarin_code

        return argostranslate.translate.translate(sentence, 
                                                  from_code, 
                                                  english_code)

DefaultTranslator = ArgosTranslate
