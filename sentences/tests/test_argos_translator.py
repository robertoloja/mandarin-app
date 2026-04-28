from django.test import TestCase

from sentences.translators.ArgosTranslator import ArgosTranslate


class ArgosTranslatorTest(TestCase):
    def test_translate_mandarin_to_german(self):
        """Argos should translate simplified Chinese to German via the zh→en→de pivot."""
        result = ArgosTranslate.translate("你好", target_language="de")

        self.assertIsInstance(result, str)
        self.assertGreater(len(result), 0)
        # The result must not be the original Chinese characters
        self.assertNotEqual(result, "你好")
        # The result must not be English (the pivot intermediate) — a basic
        # check: if the package chain works, German output should not be the
        # same as the English translation of 你好.
        english_result = ArgosTranslate.translate("你好", target_language="en")
        self.assertNotEqual(result, english_result)
