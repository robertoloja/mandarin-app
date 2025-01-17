from django.test import TestCase
from . import WiktionaryScraper


class WiktionaryTests(TestCase):
    def setUp(self):
        self.dictionary = WiktionaryScraper()

    def test_definitions(self):
        definitions = self.dictionary.get_definitions("朝政")
        expected = {
            1: {
                "definition": "(literary, historical) running of the imperial court",
                "pronunciation": ["chao2", "zheng4"],
            }
        }
        self.assertEqual(definitions, expected)

    def test_definition_does_not_exist(self):
        definitions = self.dictionary.get_definitions("好")
        expected = {
            1: {"pronunciation": ["hao3"], "definition": "good; well"},
            2: {"pronunciation": ["hao3"], "definition": "to be fond of; to like"},
        }
        self.assertEqual(definitions, expected)
