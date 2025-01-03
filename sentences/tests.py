import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from django.test import TestCase  # noqa: E402

from .models import CEDictionary  # noqa: E402
from .segmenters import JiebaSegmenter  # noqa: E402
from .functions import create_dictionary_single_hanzi  # noqa: E402


class DictionaryTests(TestCase):
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

    def test_populate_database_function(self):
        """
        This needs to enqueue the multi-character words, then populate the database
        with single-character words first, and finally establish the relationships
        between words and their constituent hanzi.

        N.B.: This test has to be run after an initial
        plain migration (just create the tables in sentences.models)
        """

        test_dictionary_input = """一字不落 一字不落 [yi1 zi4 bu4 la4] /see 一字不漏[yi1 zi4 bu4 lou4]/
齒齦炎 齿龈炎 [chi3 yin2 yan2] /gingivitis/another definition/
一 一 [yi1] /one/single/a (article)/as soon as/entire; whole; all; throughout/"one" radical in Chinese characters (Kangxi radical 1)/also pr. [yao1] for greater clarity when spelling out numbers digit by digit/
字 字 [zi4] /letter/symbol/character/word/CL:個|个[ge4]/courtesy or style name traditionally given to males aged 20 in dynastic China/
不 不 [bu4] /no; not so/(bound form) not; un-/
毒 毒 [du2] /poison/to poison/poisonous/malicious/cruel/fierce/narcotics/
落 落 [la4] /to leave out/to be missing/to leave behind or forget to bring/to lag or fall behind/
落 落 [lao4] /colloquial reading for 落[luo4] in certain compounds/
落 落 [luo4] /to fall or drop/(of the sun) to set/(of a tide) to go out/to lower/to decline or sink/to lag or fall behind/to fall onto/to rest with/to get or receive/to write down/whereabouts/settlement/
齒 齿 [chi3] /tooth/CL:顆|颗[ke1]/
齦 龈 [ken3] /variant of 啃[ken3]/
齦 龈 [yin2] /gums (of the teeth)/
炎 炎 [yan2] /flame/inflammation/-itis/
狀 状 [zhuang4] /(bound form) form; appearance; shape/(bound form) state; condition/(bound form) to describe/(bound form) written complaint; lawsuit/(bound form) certificate/
2019冠狀病毒病 2019冠状病毒病 [er4 ling2 yi1 jiu3 guan1 zhuang4 bing4 du2 bing4] /COVID-19, the coronavirus disease identified in 2019/
冠 冠 [guan1] /hat/crown/crest/cap/
病 病 [bing4] /illness/CL:場|场[chang2]/disease/to fall ill/defect/
"""
        create_dictionary_single_hanzi(test_dictionary_input)

        for word in ["齒齦炎", "一字不落"]:
            queried_word = CEDictionary.objects.get(traditional=word)
            queried_word.constituent_hanzi.all()
            reconstructed_word = "".join(
                map(
                    lambda x: x["traditional"],
                    queried_word.constituent_hanzi.all().values("traditional"),
                )
            )
            self.assertEqual(queried_word.traditional, reconstructed_word)


class SegmentationTests(TestCase):
    def test_jieba_loads_dict(self):
        JiebaSegmenter.segment("不列顛保衛戰")

    def test_easy_segmentation(self):
        segments = JiebaSegmenter.segment("我来到北京清华大学")
        self.assertEqual(segments, ["我", "来到", "北京", "清华大学"])
