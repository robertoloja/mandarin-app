import argostranslate.package
import argostranslate.translate

# Download and install Argos Translate package. Only runs on server bootup. 
to_code = "en"
from_code = "zt" #TODO: Implement simplified mandarin too.

argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()
package_to_install = next(
    filter(
        lambda x: x.from_code == from_code and
        x.to_code == to_code, available_packages
    )
)
argostranslate.package.install_from_path(package_to_install.download())

class ArgosTranslate:
    @staticmethod
    def translate(sentence: str) -> str:
        return argostranslate.translate.translate(sentence, 
                                                  from_code, 
                                                  to_code)

DefaultTranslator = ArgosTranslate
