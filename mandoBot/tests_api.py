import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()  # this is here for VSCode test discovery

from django.test import TestCase  # noqa: E402
from ninja.testing import TestClient  # noqa: E402
from mandoBot.api import api  # noqa: E402


class SegmentationAPITest(TestCase):
    def setUp(self):
        api.urls_namespace = api.urls_namespace + "1"  # new namespace for each test
        self.client = TestClient(api)
        self.emptyResponse = {
            "translation": "",
            "dictionary": {},
            "sentence": [{"word": "", "pinyin": [""], "definitions": []}],
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
            "definitions": [],
        }
        self.assertEqual(response.data, english_only_response)

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
                    "pinyin": ["běi", "jīng"],
                    "definitions": [
                        "Beijing municipality, capital of the People's Republic of China (abbr. to 京[Jing1])"
                    ],
                },
                {
                    "word": "在",
                    "pinyin": ["zài"],
                    "definitions": [
                        "to exist; to be alive/(of sb or sth) to be (located) at/(used before a verb to indicate an action in progress)"
                    ],
                },
                {"word": "中國", "pinyin": ["zhōng", "guó"], "definitions": ["China"]},
                {
                    "word": "大陸",
                    "pinyin": ["dà", "lù"],
                    "definitions": [
                        "mainland China (reference to the PRC)",
                        "continent; mainland/CL:個|个[ge4],塊|块[kuai4]",
                    ],
                },
            ],
        },
        "simplified": {
            "request_data": "北京在中国大陆",
            "expected_sentence": [
                {
                    "word": "北京",
                    "pinyin": ["běi", "jīng"],
                    "definitions": [
                        "Beijing municipality, capital of the People's Republic of China (abbr. to 京[Jing1])"
                    ],
                },
                {
                    "word": "在",
                    "pinyin": ["zài"],
                    "definitions": [
                        "to exist; to be alive/(of sb or sth) to be (located) at/(used before a verb to indicate an action in progress)"
                    ],
                },
                {"word": "中国", "pinyin": ["zhōng", "guó"], "definitions": ["China"]},
                {
                    "word": "大陆",
                    "pinyin": ["dà", "lù"],
                    "definitions": [
                        "mainland China (reference to the PRC)",
                        "continent; mainland/CL:個|个[ge4],塊|块[kuai4]",
                    ],
                },
            ],
        },
    }
