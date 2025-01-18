from datetime import datetime, date, timedelta, timezone
import json

from django.test.client import Client
from django.test import TestCase
from django.contrib.auth import get_user_model
from ninja.testing import TestClient
from dragonmapper import hanzi
from mandoBot.api.api import api
from sentences.functions import is_punctuation


class SubscriptionTests(TestCase):
    def setUp(self):
        api.urls_namespace = api.urls_namespace + "1"  # new namespace for each test
        self.client = TestClient(api)

        self.username = "test"
        self.password = "password123"
        self.email = "test@test.com"

        self.User = get_user_model()
        self.test_user = self.User.objects.create_user(
            self.username, self.email, self.password
        )

    def tearDown(self):
        self.client = None

    def test_inactive_user_becomes_active_on_payment(self):
        # 1 - Set user to inactive
        self.test_user.last_payment = date.today() - timedelta(days=60)
        self.test_user.save()
        self.assertFalse(self.test_user.subscription_is_active())

        # 2 - Send payment to /kofi
        response = Client().post(
            "/api/kofi", {"data": self.kofi_data(first_subscription=False)}
        )
        self.assertEqual(response.status_code, 200)

        # 3 - Login
        response = Client().post(
            "/api/login", {"username": self.username, "password": self.password}
        )
        expected = {
            "username": self.username,
            "email": self.email,
            "pronunciation_preference": "pinyin_acc",
            "theme_preference": 1,
        }
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)
        self.assertTrue(  # have to fetch the user again
            self.User.objects.get(email=self.email).subscription_is_active()
        )

    def test_first_payment_creates_registration_link(self):
        # TODO: Is it possible to actually check the e-mail sending
        response = Client().post(
            "/api/kofi", {"data": self.kofi_data(first_subscription=True)}
        )
        expected = {"message": "Send registration e-mail"}
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)

    def test_inactive_user_gets_error(self):
        forty_days_ago = date.today() - timedelta(days=40)
        self.test_user.last_payment = forty_days_ago
        self.test_user.save()

        response = self.client.post(
            "/login",
            {
                "username": self.username,
                "password": self.password,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data, {"error": "Subscription has expired"})

    def test_active_user_can_login(self):
        self.test_user.last_payment = date.today() - timedelta(days=1)
        self.test_user.save()
        response = Client().post(  # Django-Ninja's TestClient has no session info
            "/api/login", {"username": self.username, "password": self.password}
        )
        expected = {
            "username": self.username,
            "email": self.email,
            "pronunciation_preference": "pinyin_acc",
            "theme_preference": 1,
        }
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected)

    def kofi_data(self, first_subscription: bool):
        now = datetime.now(timezone.utc)
        date_string = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        return json.dumps(
            {
                "verification_token": "40d23770-f85d-4c4e-aab3-8e882dc342fb",
                "message_id": "5bb41b61-ed31-4def-aa5e-f06131b802db",
                "timestamp": date_string,
                "type": "Subscription",
                "is_public": True,
                "from_name": "Jo Example",
                "message": "Good luck with the integration!",
                "amount": "3.00",
                "url": "https://ko-fi.com/Home/CoffeeShop?txid=00000000-1111-2222-3333-444444444444",
                "email": self.email,
                "currency": "USD",
                "is_subscription_payment": True,
                "is_first_subscription_payment": first_subscription,
                "kofi_transaction_id": "00000000-1111-2222-3333-444444444444",
                "shop_items": True,
                "tier_name": True,
                "shipping": True,
            }
        )


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
                if character not in response.data["dictionary"]:
                    pass
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
