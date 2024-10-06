from django.test import TestCase
from .apps import create_dictionary
from .cedict_ts import mandarin_dict_unstructured
from django.apps import apps

mock_file = '''不兒道 不儿道 [bu1 r5 dao4] /(dialect) contracted form of 不知道[bu4 zhi1 dao4]/
不列顛保衛戰 不列颠保卫战 [Bu4 lie4 dian1 Bao3 wei4 zhan4] /see 不列顛戰役|不列颠战役[Bu4 lie4 dian1 Zhan4 yi4]/
'''

class TestDictionary(TestCase):
    def test_create_dictionary(self):
        dictionary = create_dictionary(mock_file)
        self.assertIsNotNone(dictionary)
        self.assertIn('simplified', dictionary['不兒道'])
        self.assertIn('pronunciation', dictionary['不兒道'])
        self.assertIn('definitions', dictionary['不兒道'])

        self.assertEqual(dictionary['不兒道'], {
            "simplified": '不儿道',
            "pronunciation": "bu1 r5 dao4",
            "definitions": ['(dialect) contracted form of 不知道[bu4 zhi1 dao4]']
        })

    def test_can_access_app_config(self):
        app_config = apps.get_app_config('sentences')
        self.assertEqual(app_config.dictionary['不兒道'], {
            "simplified": '不儿道',
            "pronunciation": "bu1 r5 dao4",
            "definitions": ['(dialect) contracted form of 不知道[bu4 zhi1 dao4]']
        })