from django.test import TestCase
from .models import ECDictionary, Sentence
from accounts.models import CustomUser
from .segmenters import JiebaSegmenter

class TestDictionary(TestCase):
    def test_dictionary_creation(self):
        result = ECDictionary.objects.filter(traditional='不兒道')

        self.assertNotEqual(0, len(result))
        self.assertEqual(result[0].traditional, '不兒道')
        self.assertEqual(result[0].simplified, '不儿道')
        self.assertEqual(result[0].pronunciation, 'bu1 r5 dao4')
        self.assertEqual(result[0].definitions, '(dialect) contracted form of 不知道[bu4 zhi1 dao4]')

    def test_words_written_the_same(self):
        result = ECDictionary.objects.filter(traditional='好')
        self.assertEqual(2, len(result))

class TestSegmentation(TestCase):
    def test_jieba_loads_dict(self):
        JiebaSegmenter.segment('不列顛保衛戰')
    
    def test_easy_segmentation(self):
        segments = JiebaSegmenter.segment('我来到北京清华大学')
        self.assertEqual(segments, ['我', '来到', '北京', '清华大学'])
    
    def test_medium_segmentation(self):
        return
        self.maxDiff = None
        phrase = '瑞典皇家科學院表示，今年的2位得主利用物理學的工具，開發了構成現今強大機器學習基礎的方法。霍普菲爾德創建了一種聯想記憶，可以存儲和重建圖像及其他類型的數據模式。辛頓則發明了一種方法，能夠自主地在數據中找到特徵，從而執行如識別圖片中特定元素等任務。'
        
        gpt_segmented_phrase = '瑞典|皇家|科學院|表示|，|今年|的|2|位|得主|利用|物理學|的|工具|，|開發|了|構成|現今|強大|機器|學習|基礎|的|方法|。|霍普菲|爾德|創建|了|一種|聯想|記憶|，|可以|存儲|和|重建|圖像|及|其他|類型|的|數據|模式|。|辛頓|則|發明|了|一|種|方法|，|能夠|自主|地|在|數據|中|找到|特徵|，|從而|執行|如|識別|圖片|中|特定|元素|等|任務|。'.split('|')

        segments = JiebaSegmenter.segment(phrase)
        self.assertEqual(segments, gpt_segmented_phrase)

    def test_segments_and_saves(self):
        user = CustomUser(name="foo", email="foo@bar.ca")
        user.save()
        sentence = '瑞典皇家科學院表示，今年的2位得主利用物理學的工具，開發了構成現今強大機器學習基礎的方法。霍普菲爾德創建了一種聯想記憶，可以存儲和重建圖像及其他類型的數據模式。辛頓則發明了一種方法，能夠自主地在數據中找到特徵，從而執行如識別圖片中特定元素等任務。'
        Sentence(text=sentence, user=user).save()
        pass