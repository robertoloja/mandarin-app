from typing import List
from django.test import TestCase

from .models import CEDictionary
from .segmenters import JiebaSegmenter, Segmenter, SentenceSegment
from .dictionaries import WiktionaryScraper


class DictionaryTests(TestCase):
    def test_dictionary_creation(self):
        result = CEDictionary.objects.filter(traditional="不兒道")

        self.assertNotEqual(0, len(result))
        self.assertEqual(result[0].traditional, "不兒道")
        self.assertEqual(result[0].simplified, "不儿道")
        # TODO: Fix next line (should be re5)
        self.assertEqual(result[0].pronunciation, "bu1 r5 dao4")
        self.assertEqual(
            result[0].definitions, "(dialect) contracted form of 不知道[bu4 zhi1 dao4]"
        )

    def test_words_written_the_same(self):
        result = CEDictionary.objects.filter(traditional="好")
        self.assertEqual(2, len(result))


class SegmentationTests(TestCase):
    def test_chengyu(self):
        chengyu = [
            {"word": "分久必合", "pinyin": ["1"], "zhuyin": ["1"], "definitions": []},
            {"word": "，", "pinyin": ["2"], "zhuyin": ["2"], "definitions": []},
            {"word": "合久必分", "pinyin": ["3"], "zhuyin": ["3"], "definitions": []},
        ]

        expected: List[SentenceSegment] = [
            {
                "word": "分久必合,合久必分",
                "pinyin": ["1", "2", "3"],
                "zhuyin": ["1", "2", "3"],
                "definitions": [],
            },
        ]

        concatenated_chengyu = JiebaSegmenter.try_to_concat(chengyu, 0)
        self.assertEqual(expected, concatenated_chengyu)

    def test_dictionary_contains_traditional_when_word_is_traditional(self):
        sentence = "話說天下大勢分久必合，合久必分。周末，七國分爭，並入于秦。及，秦滅之後，楚、漢分爭，又並入於漢。漢朝自高祖斬白蛇而起義一統天下。後來，光武中興。傳至獻帝，遂分為三國。推其致亂之由，殆始於桓、靈二帝。"
        segmented = JiebaSegmenter.segment_and_translate(sentence)
        pass

    def test_choose_most_common_hanzi(self):
        test_hanzi = "上"
        answer = Segmenter.most_frequent_pronunciation(test_hanzi)
        expected = CEDictionary.objects.get(traditional="上", pronunciation="shang4")
        self.assertEqual(expected, answer)

    def test_jieba_loads_dict(self):
        JiebaSegmenter.segment("不列顛保衛戰")

    def test_easy_segmentation(self):
        segments = JiebaSegmenter.segment("我来到北京清华大学")
        self.assertEqual(segments, ["我", "来到", "北京", "清华大学"])

    def test_problematic_segmentation(self):
        foo = JiebaSegmenter.add_definitions_and_create_dictionary(
            [
                {
                    "word": "少帝",
                    "pinyin": ["shao4", "di4"],
                    "zhuyin": ["ㄕㄠˋ", "ㄉㄧˋ"],
                    "definitions": [],
                }
            ]
        )
        pass


class WiktionaryTests(TestCase):
    def setUp(self):
        self.dictionary = WiktionaryScraper()

    def test_definitions(self):
        definitions = self.dictionary.get_definitions("朝政")
        expected = {
            1: {
                "definition": "(literary, historical) running of the imperial court",
                "pronunciation": "chao2 zheng4",
            }
        }
        self.assertEqual(definitions, expected)

    def test_definition_does_not_exist(self):
        definitions = self.dictionary.get_definitions("好")
        expected = {
            1: {"pronunciation": "hao3", "definition": "good; well"},
            2: {"pronunciation": "hao3", "definition": "to be fond of; to like"},
        }
        self.assertEqual(definitions, expected)
