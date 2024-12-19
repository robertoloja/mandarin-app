import argostranslate.package
import argostranslate.translate
# from onmt.translate.translator import build_translator

# Download and install Argos Translate package
to_code = "en"
from_code = "zt"

argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()
package_to_install = next(
    filter(
        lambda x: x.from_code == from_code and
        x.to_code == to_code, available_packages
    )
)
argostranslate.package.install_from_path(package_to_install.download())

# Load OpenNMT model
#translator = build_translator("./lcsts_acc_56.86_ppl_10.97_e11.pt", report_score=False)

class ArgosTranslate:
    @staticmethod
    def translate(sentence: str) -> str:
        return argostranslate.translate.translate(sentence, 
                                                  from_code, 
                                                  to_code)

# class OpenNMT:
#     @staticmethod
#     def translate(sentence: str) -> str:
#         translation = translator.translate([sentence])
#         return translation

DefaultTranslator = ArgosTranslate