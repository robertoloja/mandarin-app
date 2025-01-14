import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from django.test import TestCase  # noqa: E402
from ninja.testing import TestClient  # noqa: E402
from dragonmapper import hanzi  # noqa: E402
from mandoBot.api import api  # noqa: E402
from sentences.functions import is_punctuation  # noqa: E402


class SegmentationAPITest(TestCase):
    def setUp(self):
        api.urls_namespace = api.urls_namespace + "1"  # new namespace for each test
        self.client = TestClient(api)
        self.emptyResponse = {
            "translation": "",
            "dictionary": {"word": {"english": [], "pinyin": [], "zhuyin": []}},
            "sentence": [{"word": "", "pinyin": [], "zhuyin": [], "definitions": []}],
        }

    def tearDown(self):
        self.client = None

    def test_empty_request(self):
        response = self.client.post("/segment?data=")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, self.emptyResponse)

    def test_no_mandarin_request(self):
        request_data = "english"
        response = self.client.post(f"/segment?data={request_data}")

        english_only_response = self.emptyResponse
        english_only_response["translation"] = request_data
        english_only_response["sentence"][0] = {
            "word": request_data,
            "pinyin": [request_data],
            "zhuyin": [request_data],
            "definitions": [],
        }
        self.assertEqual(response.data, english_only_response)

    def test_includes_punctuation(self):
        request_data = "《北京城市总体规划（2016年—2035年）》"
        response = self.client.post(f"/segment?data={request_data}")
        pass  # TODO: Finish

    def test_dictionary(self):
        test_sentences = [
            "〔記者余瑞仁／桃園報導〕桃園市觀音工業區經建一路的臻鼎集團先豐通訊公司，今（5日）中午12時37分許發生火警，大量黑煙直竄天際，煙塵瀰漫整個觀音工業區及附近重劃區的住宅區，地方臉書社群網友紛紛貼文示警：「火很大、消防車一直來」，也呼籲民眾不要外出以免被毒煙影響，「電路板燒起來很毒，大家注意」！桃園市消防局表示，119勤務指揮中心於今天中午12點37分許接獲報案，指觀音區經建一路的先鋒通訊公司廠房發生火警，失火處為地上5層廠房的第2樓層，現場有存放毒化物及危險物品，消防局派遣草漯分隊及附近分隊62名消防員、消防車25輛、救護車3輛前往灌救，目前火勢尚未控制仍延燒中，消防人員積極搶中。",
            "北京市，通称北京，简称“京”，曾称“北平”[註 2]，中华人民共和国的首都及直辖市",
            "特徵",
            "而",
            "少帝",
        ]
        for sentence in test_sentences:
            request_data = sentence
            response = self.client.post(f"/segment?data={request_data}")

            for character in request_data:
                if hanzi.has_chinese(character) and not is_punctuation(character):
                    self.assertTrue(character in response.data["dictionary"])
                    # TODO: Test pinyin also

    def test_mandarin_is_segmented_traditional(self):
        request_data = self.test_sentences["traditional"]["request_data"]
        response = self.client.post(f"/segment?data={request_data}")

        self.assertEqual(
            response.data["sentence"],
            self.test_sentences["traditional"]["expected_sentence"],
        )

    def test_mandarin_is_segmented_simplified(self):
        request_data = self.test_sentences["simplified"]["request_data"]
        response = self.client.post(f"/segment?data={request_data}")

        self.assertEqual(
            response.data["sentence"],
            self.test_sentences["simplified"]["expected_sentence"],
        )

    test_sentences = {
        "traditional": {
            "request_data": "北京在中國大陸",
            "expected_sentence": [
                {
                    "word": "北京",
                    "pinyin": ["Bei3", "jing1"],
                    "zhuyin": ["ㄅㄟˇ", "ㄐㄧㄥ"],
                    "definitions": [
                        "Beijing municipality, capital of the People's Republic of China (abbr. to 京[Jing1])"
                    ],
                },
                {
                    "word": "在",
                    "pinyin": ["zai4"],
                    "zhuyin": ["ㄗㄞˋ"],
                    "definitions": [
                        "to exist; to be alive / (of sb or sth) to be (located) at / (used before a verb to indicate an action in progress)"
                    ],
                },
                {
                    "word": "中國",
                    "pinyin": ["Zhong1", "guo2"],
                    "zhuyin": ["ㄓㄨㄥ", "ㄍㄨㄛˊ"],
                    "definitions": ["China"],
                },
                {
                    "word": "大陸",
                    "pinyin": ["da4", "lu4"],
                    "zhuyin": ["ㄉㄚˋ", "ㄌㄨˋ"],
                    "definitions": [
                        "mainland China (reference to the PRC)",
                        "continent; mainland / CL:個|个[ge4],塊|块[kuai4]",
                    ],
                },
            ],
        },
        "simplified": {
            "request_data": "北京在中国大陆",
            "expected_sentence": [
                {
                    "word": "北京",
                    "pinyin": ["Bei3", "jing1"],
                    "zhuyin": ["ㄅㄟˇ", "ㄐㄧㄥ"],
                    "definitions": [
                        "Beijing municipality, capital of the People's Republic of China (abbr. to 京[Jing1])"
                    ],
                },
                {
                    "word": "在",
                    "pinyin": ["zai4"],
                    "zhuyin": ["ㄗㄞˋ"],
                    "definitions": [
                        "to exist; to be alive / (of sb or sth) to be (located) at / (used before a verb to indicate an action in progress)"
                    ],
                },
                {
                    "word": "中国",
                    "pinyin": ["Zhong1", "guo2"],
                    "zhuyin": ["ㄓㄨㄥ", "ㄍㄨㄛˊ"],
                    "definitions": ["China"],
                },
                {
                    "word": "大陆",
                    "pinyin": ["da4", "lu4"],
                    "zhuyin": ["ㄉㄚˋ", "ㄌㄨˋ"],
                    "definitions": [
                        "mainland China (reference to the PRC)",
                        "continent; mainland / CL:個|个[ge4],塊|块[kuai4]",
                    ],
                },
            ],
        },
    }
