import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from django.test import TestCase  # noqa: E402

from .models import CEDictionary  # noqa: E402
from .segmenters import JiebaSegmenter  # noqa: E402


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
        for word in ["齒齦炎", "一字不落", "北京市", "中文"]:
            queried_word = CEDictionary.objects.get(traditional=word)
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
