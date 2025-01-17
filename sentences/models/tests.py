from django.test import TestCase
from . import CEDictionary


class CEDictionaryTests(TestCase):
    def test_dictionary_creation(self):
        result = CEDictionary.objects.filter(traditional="不兒道")

        self.assertNotEqual(0, len(result))
        self.assertEqual(result[0].traditional, "不兒道")
        self.assertEqual(result[0].simplified, "不儿道")
        self.assertEqual(result[0].pronunciation, "bu1 r5 dao4")
        self.assertEqual(
            result[0].definitions, "(dialect) contracted form of 不知道[bu4 zhi1 dao4]"
        )

    def test_words_written_the_same(self):
        result = CEDictionary.objects.filter(traditional="好")
        self.assertEqual(2, len(result))
