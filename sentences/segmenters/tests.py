from typing import List
from django.test import TestCase

from ..segmenters import JiebaSegmenter, Segmenter
from ..segmenters.types import SentenceSegment
from models import CEDictionary


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

    def test_concatenated_chengyu_is_found(self):
        chengyu_phrase = "分久必合，合久必分"
        segmented = JiebaSegmenter.segment_and_translate(chengyu_phrase)
        self.assertEqual(segmented["translation"], "foo")

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