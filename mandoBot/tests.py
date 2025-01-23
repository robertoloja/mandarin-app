from django.test import TestCase
from ninja.testing import TestClient
from dragonmapper import hanzi
from mandoBot.api import api
from sentences.functions import is_punctuation


class SegmentationAPITest(TestCase):
    def setUp(self):
        api.urls_namespace = api.urls_namespace + "1"  # new namespace for each test
        self.client: TestClient = TestClient(api)
        self.emptyResponse = {
            "translation": "",
            "dictionary": {"word": {"english": [], "pinyin": [], "zhuyin": []}},
            "sentence": [{"word": "", "pinyin": [], "zhuyin": [], "definitions": []}],
        }

    def tearDown(self):
        self.client.delete

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

    def test_dictionary_includes_all_characters(self):
        test_sentences = [
            "特徵",
            "少帝",
        ]
        for index, sentence in enumerate(test_sentences):
            response = self.client.post(f"/segment?data={sentence}")
            for character in sentence:
                if hanzi.has_chinese(character) and not is_punctuation(character):
                    self.assertTrue(character in response.data["dictionary"])

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
