from typing import List
from django.test import TestCase

from . import JiebaSegmenter, Segmenter
from .types import SentenceSegment
from ..models import CEDictionary


class SegmentationTests(TestCase):
    def test_chengyu(self):
        chengyu = [
            {"word": "分久必合", "pinyin": ["1"], "zhuyin": ["A"], "definitions": []},
            {"word": "，", "pinyin": ["2"], "zhuyin": ["2"], "definitions": []},
            {"word": "合久必分", "pinyin": ["3"], "zhuyin": ["B"], "definitions": []},
        ]

        expected: List[SentenceSegment] = [
            {
                "word": "分久必合合久必分",
                "pinyin": ["1", ",", "3"],
                "zhuyin": ["A", ",", "B"],
                "definitions": [],
            },
        ]

        concatenated_chengyu = Segmenter.try_to_concat(chengyu, 0)
        self.assertEqual(expected, concatenated_chengyu)

    def test_concatenated_chengyu_is_found(self):
        chengyu_phrase = "分久必合，合久必分"
        segmented = Segmenter.segment_and_translate(chengyu_phrase)
        expected = [
            "lit. that which is long divided must unify, and that which is long unified must divide (idiom, from 三國演義|三国演义[San1 guo2 Yan3 yi4]) / fig. things are constantly changing"
        ]
        self.assertEqual(segmented["sentence"][0]["definitions"], expected)

    def test_choose_most_common_hanzi(self):
        test_hanzi = "上"
        answer = Segmenter.most_frequent_pronunciation(test_hanzi)
        expected = CEDictionary.objects.get(traditional="上", pronunciation="shang4")
        self.assertEqual(expected, answer)

    def test_jieba_loads_dict(self):
        JiebaSegmenter.segment("不列顛保衛戰")

    def test_dictionary_only_includes_single_hanzi(self):
        phrase = "話說天下大勢分久必合，合久必分。周末，七國分爭，並入于秦。及，秦滅之後，楚、漢分爭，又並入於漢。漢朝自高祖斬白蛇而起義一統天下。後來，光武中興。傳至獻帝，遂分為三國。推其致亂之由，殆始於桓、靈二帝。"
        sentence = Segmenter.segment_and_translate(phrase)

        for hanzi in sentence["dictionary"]:
            self.assertEqual(len(hanzi), 1)

    def test_easy_segmentation(self):
        segments = JiebaSegmenter.segment("我来到北京清华大学")
        self.assertEqual(segments, ["我", "来到", "北京", "清华大学"])

    def test_problematic_segmentation(self):
        foo = Segmenter.add_definitions_and_create_dictionary(
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
