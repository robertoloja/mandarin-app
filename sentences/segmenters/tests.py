from django.test import TestCase

from mandoBot.schemas import ChineseDictionary, MandarinWordSchema, SegmentationResponse
from sentences.functions import is_punctuation

from . import JiebaSegmenter, Segmenter
from ..models import CEDictionary


class SegmentationTests(TestCase):
    def test_find_umlaut(self):
        word = "女"
        result = Segmenter.segment_and_translate(word)
        expected = SegmentationResponse(
            dictionary={
                "女": ChineseDictionary(
                    english=["female / woman / daughter"],
                    pinyin=["nü3"],
                    zhuyin=["ㄋㄩˇ"],
                )
            },
            sentence=[
                MandarinWordSchema(
                    definitions=["female / woman / daughter"],
                    pinyin=["nü3"],
                    word="女",
                    zhuyin=["ㄋㄩˇ"],
                )
            ],
            translation="Women",
        )
        self.assertEqual(result, expected)

    def test_add_defs(self):
        manually_segmented = ["無關大體"]
        bar = Segmenter.add_pronunciations(manually_segmented)
        sentence, dictionary = Segmenter.add_definitions_and_create_dictionary(bar)
        json_sentence = [x.model_dump_json() for x in sentence]
        expected = [
            '{"word":"無關大體","pinyin":["wu2","guan1","da4","ti3"],"zhuyin":["ㄨˊ","ㄍㄨㄢ","ㄉㄚˋ","ㄊㄧˇ"],"definitions":["to have no bearing or influence on the overall situation"]}'
        ]
        word_in_db = CEDictionary.objects.filter(traditional=manually_segmented[0])
        self.assertTrue(word_in_db.exists())
        self.assertEqual(json_sentence, expected)

        for hanzi in manually_segmented[0]:
            self.assertIn(hanzi, dictionary.keys())

    # def test_write_file(self):
    #     foo = [
    #         "沒有",
    #         "喫",
    #         "過",
    #         "人",
    #         "的",
    #         "孩子",
    #         "，",
    #         "或者",
    #         "還",
    #         "有",
    #         "？",
    #         "救",
    #         "救",
    #         "孩子",
    #         "……",
    #         "一",
    #         "九",
    #         "一",
    #         "八",
    #         "年",
    #         "四",
    #         "月",
    #     ]
    # bar = Segmenter.add_pronunciations(foo)
    # sentence, dictionary = Segmenter.add_definitions_and_create_dictionary(bar)

    # json_sentence = [x.model_dump_json() for x in sentence]
    # with open("output.txt", "w") as file:
    #     file.write("[" + ",".join(json_sentence) + "]")

    def test_umlaut_pronunciation(self):
        word = ["旅游"]
        pronunciation = Segmenter.add_pronunciations(word)[0].pinyin
        expected = ["lü3", "you2"]
        self.assertEqual(pronunciation, expected)

    def test_pinyin_colon_to_umlaut(self):
        pinyin = "nu:3"
        converted = Segmenter.pinyin_to_zhuyin(pinyin)
        expected = "ㄋㄩˇ"
        self.assertEqual(converted, expected)

    def test_problematic_hanzi(self):
        sentence = "掙紮"
        # sentence = "巴賽族"
        result = Segmenter.segment_and_translate(sentence)

        print(result.dictionary)
        for word in result.dictionary:
            self.assertNotEqual(result.dictionary[word].english, [])
            self.assertNotEqual(result.dictionary[word].pinyin, [])
            self.assertNotEqual(result.dictionary[word].zhuyin, [])

    def test_chengyu(self):
        chengyu = [
            MandarinWordSchema(
                word="分久必合", pinyin=["1"], zhuyin=["A"], definitions=[]
            ),
            MandarinWordSchema(word="，", pinyin=["2"], zhuyin=["B"], definitions=[]),
            MandarinWordSchema(
                word="合久必分", pinyin=["3"], zhuyin=["C"], definitions=[]
            ),
        ]

        expected = [
            MandarinWordSchema(
                word="分久必合合久必分",
                pinyin=["1", ",", "3"],
                zhuyin=["A", ",", "C"],
                definitions=[],
            ),
        ]

        concatenated_chengyu = Segmenter.try_to_concat(chengyu, 0)
        self.assertEqual(expected, concatenated_chengyu)

    def test_concatenated_chengyu_is_found(self):
        chengyu_phrase = "分久必合，合久必分"
        segmented = Segmenter.segment_and_translate(chengyu_phrase)
        expected = [
            "lit. that which is long divided must unify, and that which is long unified must divide (idiom, from 三國演義|三国演义[San1 guo2 Yan3 yi4]) / fig. things are constantly changing"
        ]
        self.assertEqual(segmented.sentence[0].definitions, expected)

    def test_does_not_duplicate_definitions_before_chengyu(self):
        sentence = "話說天下大勢分久必合，合久必分"
        segmented = Segmenter.segment_and_translate(sentence)

        for word in segmented.sentence:
            self.assertEqual(len(word.definitions), 1)

        for hanzi in sentence:
            if not is_punctuation(hanzi):
                self.assertTrue(hanzi in segmented.dictionary)

    def test_choose_most_common_hanzi(self):
        test_hanzi = "上"
        answer = Segmenter.most_frequent_pronunciation(test_hanzi)
        expected = CEDictionary.objects.get(traditional="上", pronunciation="shang4")
        self.assertEqual(expected, answer)

    def test_dictionary_only_includes_single_hanzi(self):
        phrase = "話說天下大勢分久必合，合久必分。"
        sentence = Segmenter.segment_and_translate(phrase)

        for hanzi in sentence.dictionary:
            self.assertEqual(len(hanzi), 1)

    def test_easy_segmentation(self):
        segments = JiebaSegmenter.segment("我来到北京清华大学")
        self.assertEqual(segments, ["我", "来到", "北京", "清华大学"])
