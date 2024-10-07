from django.test import TestCase
from .models import ECDictionary

mock_file = '''不兒道 不儿道 [bu1 r5 dao4] /(dialect) contracted form of 不知道[bu4 zhi1 dao4]/
不列顛保衛戰 不列颠保卫战 [Bu4 lie4 dian1 Bao3 wei4 zhan4] /see 不列顛戰役|不列颠战役[Bu4 lie4 dian1 Zhan4 yi4]/
好 好 [hao3] /good/appropriate; proper/all right!/(before a verb) easy to/(before a verb) good to/(before an adjective for exclamatory effect) so/(verb complement indicating completion)/(of two people) close; on intimate terms/(after a personal pronoun) hello/
好 好 [hao4] /to be fond of; to have a tendency to; to be prone to/
'''

class TestDictionary(TestCase):
    def test_dictionary_creeation(self):
        result = ECDictionary.objects.filter(traditional='不兒道')

        self.assertNotEqual(0, len(result))
        self.assertEqual(result[0].traditional, '不兒道')
        self.assertEqual(result[0].simplified, '不儿道')
        self.assertEqual(result[0].pronunciation, 'bu1 r5 dao4')
        self.assertEqual(result[0].definitions, '(dialect) contracted form of 不知道[bu4 zhi1 dao4]')

    def test_words_written_the_same(self):
        result = ECDictionary.objects.filter(traditional='好')
        self.assertEqual(2, len(result))