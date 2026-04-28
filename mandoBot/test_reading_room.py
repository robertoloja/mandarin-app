from django.test import TestCase
from ninja.testing import TestClient
from mandoBot.api import api


# A minimal but structurally complete fixture that mirrors two_brothers.json.
# Contains two sentence words (one Chinese, one punctuation) and one dictionary
# entry — enough to verify every part of the required response shape.
DIARY_ZERO_FIXTURE = {
    "translation": {
        "en": (
            "A certain pair of brothers, whose names I shall conceal for now, "
            "were both good friends of mine back during our school days."
        ),
        "de": (
            "Während meiner Schulzeit war ich gut mit einem Brüderpaar befreundet, "
            "deren Namen ich vorerst noch geheim halten möchte."
        ),
    },
    "sentence": [
        {
            "word": "某",
            "pinyin": ["mou3"],
            "zhuyin": ["ㄇㄡˇ"],
            "definitions": {
                "en": ["some / a certain / sb or sth indefinite / such-and-such"],
                "de": ["ein gewisser (Adj); irgendein"],
            },
        },
        {
            "word": "君",
            "pinyin": ["jun1"],
            "zhuyin": ["ㄐㄩㄣ"],
            "definitions": {
                "en": ["monarch / lord / gentleman / ruler"],
                "de": ["Fürst (S, Pol) / Herr (S) / Sie (Pron)"],
            },
        },
        {
            "word": "。",
            "pinyin": ["。"],
            "zhuyin": ["。"],
            "definitions": {},
        },
    ],
    "dictionary": {
        "某": {
            "en": ["some / a certain / sb or sth indefinite / such-and-such"],
            "de": ["ein gewisser (Adj); irgendein"],
            "pinyin": ["mou3"],
            "zhuyin": ["ㄇㄡˇ"],
        },
        "君": {
            "en": ["monarch / lord / gentleman / ruler"],
            "de": ["Fürst (S, Pol) / Herr (S) / Sie (Pron)"],
            "pinyin": ["jun1"],
            "zhuyin": ["ㄐㄩㄣ"],
        },
    },
}


class ReadingRoomAPITest(TestCase):
    def setUp(self):
        api.urls_namespace = api.urls_namespace + "_rr"
        self.client = TestClient(api)

        # This import will fail (ImportError) until ReadingRoomChapter is created —
        # that is the expected red state.
        from sentences.models.ReadingRoomChapter import ReadingRoomChapter

        self.chapter = ReadingRoomChapter.objects.create(
            book_slug="diary-of-a-madman",
            chapter_order=0,
            chapter_number="0",
            title="Two Brothers",
            data=DIARY_ZERO_FIXTURE,
        )

    # --- Status ---

    def test_chapter_endpoint_returns_200(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        self.assertEqual(response.status_code, 200)

    def test_nonexistent_chapter_returns_404(self):
        response = self.client.get("/reading-room/diary-of-a-madman/99/")
        self.assertEqual(response.status_code, 404)

    def test_nonexistent_book_returns_404(self):
        response = self.client.get("/reading-room/nonexistent-book/0/")
        self.assertEqual(response.status_code, 404)

    # --- Top-level shape ---

    def test_response_has_required_top_level_keys(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        self.assertIn("translation", response.data)
        self.assertIn("sentence", response.data)
        self.assertIn("dictionary", response.data)

    # --- translation ---

    def test_translation_has_en_and_de(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        translation = response.data["translation"]
        self.assertIn("en", translation)
        self.assertIn("de", translation)
        self.assertIsInstance(translation["en"], str)
        self.assertIsInstance(translation["de"], str)
        self.assertGreater(len(translation["en"]), 0)
        self.assertGreater(len(translation["de"]), 0)

    # --- sentence ---

    def test_sentence_is_a_non_empty_list(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        sentence = response.data["sentence"]
        self.assertIsInstance(sentence, list)
        self.assertGreater(len(sentence), 0)

    def test_each_sentence_word_has_required_keys(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        for word in response.data["sentence"]:
            self.assertIn("word", word)
            self.assertIn("pinyin", word)
            self.assertIn("zhuyin", word)
            self.assertIn("definitions", word)
            self.assertIsInstance(word["pinyin"], list)
            self.assertIsInstance(word["zhuyin"], list)

    def test_non_punctuation_sentence_definitions_have_en_and_de(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        # Find first word that has definitions (i.e. not punctuation)
        chinese_words = [
            w for w in response.data["sentence"] if w["definitions"]
        ]
        self.assertGreater(len(chinese_words), 0)
        for word in chinese_words:
            self.assertIn("en", word["definitions"])
            self.assertIn("de", word["definitions"])
            self.assertIsInstance(word["definitions"]["en"], list)
            self.assertIsInstance(word["definitions"]["de"], list)

    # --- dictionary ---

    def test_dictionary_is_a_non_empty_dict(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        dictionary = response.data["dictionary"]
        self.assertIsInstance(dictionary, dict)
        self.assertGreater(len(dictionary), 0)

    def test_dictionary_keys_are_single_characters(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        for hanzi in response.data["dictionary"]:
            self.assertEqual(
                len(hanzi), 1,
                f"Dictionary key {hanzi!r} should be a single character"
            )

    def test_dictionary_entries_have_required_keys(self):
        response = self.client.get("/reading-room/diary-of-a-madman/0/")
        for hanzi, entry in response.data["dictionary"].items():
            self.assertIn("en", entry, f"Missing 'en' for {hanzi}")
            self.assertIn("de", entry, f"Missing 'de' for {hanzi}")
            self.assertIn("pinyin", entry, f"Missing 'pinyin' for {hanzi}")
            self.assertIn("zhuyin", entry, f"Missing 'zhuyin' for {hanzi}")
            self.assertIsInstance(entry["en"], list)
            self.assertIsInstance(entry["de"], list)
            self.assertIsInstance(entry["pinyin"], list)
            self.assertIsInstance(entry["zhuyin"], list)
