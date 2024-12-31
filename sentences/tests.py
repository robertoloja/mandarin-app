import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery
from django.test import TestCase  # noqa: E402
from .models import CEDictionary, Sentence  # noqa: E402
from django.contrib.auth import get_user_model  # noqa: E402
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


class SegmentationTests(TestCase):
    def test_jieba_loads_dict(self):
        JiebaSegmenter.segment("不列顛保衛戰")

    def test_easy_segmentation(self):
        segments = JiebaSegmenter.segment("我来到北京清华大学")
        self.assertEqual(segments, ["我", "来到", "北京", "清华大学"])

    def test_segments_and_saves(self):
        User = get_user_model()
        user = User.objects.create_user(
            username="will", email="will@email.com", password="testpass123"
        )
        user.save()
        sentence = "瑞典皇家科學院表示，今年的2位得主利用物理學的工具，開發了構成現今強大機器學習基礎的方法。霍普菲爾德創建了一種聯想記憶，可以存儲和重建圖像及其他類型的數據模式。辛頓則發明了一種方法，能夠自主地在數據中找到特徵，從而執行如識別圖片中特定元素等任務。"
        sentence_query = Sentence(text=sentence, user=user)
        sentence_query.save()

        segments = JiebaSegmenter.segment(sentence)

        for i in range(len(segments)):
            self.assertEqual(segments[i], sentence_query.segmented()[i])
