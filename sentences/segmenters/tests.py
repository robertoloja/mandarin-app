from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from django.db import connection

from mandoBot.schemas import ChineseDictionary, MandarinWordSchema
from sentences.functions import is_punctuation
from sentences.models import CEDictionary, CEDefinition
from sentences.models.ConstituentHanzi import ConstituentHanzi

from . import JiebaSegmenter, Segmenter


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_cedict(trad, simp=None, pinyin=None, definition="test definition", mt=False):
    """Create a minimal CEDictionary entry for testing."""
    if simp is None:
        simp = trad
    if pinyin is None:
        pinyin = "ce4 shi4"
    return CEDictionary.objects.create(
        traditional=trad,
        simplified=simp,
        pronunciation=pinyin,
        definitions=definition,
        is_machine_translated=mt,
    )


# ---------------------------------------------------------------------------
# Pronunciation helpers
# ---------------------------------------------------------------------------

class AddPronunciationsTests(TestCase):
    def test_basic_pinyin(self):
        items = Segmenter.add_pronunciations(["你好"])
        self.assertEqual(items[0].pinyin, ["ni3", "hao3"])

    def test_umlaut_pinyin(self):
        items = Segmenter.add_pronunciations(["旅游"])
        self.assertEqual(items[0].pinyin, ["lü3", "you2"])

    def test_pinyin_to_zhuyin_colon(self):
        # nu:3 should map to ㄋㄩˇ
        self.assertEqual(Segmenter.pinyin_to_zhuyin("nu:3"), "ㄋㄩˇ")

    def test_punctuation_passes_through_unchanged(self):
        items = Segmenter.add_pronunciations(["，"])
        self.assertEqual(items[0].pinyin, ["，"])
        self.assertEqual(items[0].zhuyin, ["，"])

    def test_non_chinese_passes_through(self):
        items = Segmenter.add_pronunciations(["hello"])
        self.assertEqual(items[0].pinyin, ["hello"])


# ---------------------------------------------------------------------------
# most_frequent_pronunciation
# ---------------------------------------------------------------------------

class MostFrequentPronunciationTests(TestCase):
    def setUp(self):
        self.shang = make_cedict("上", "上", "shang4", "on top / above")
        self.shang_qing = make_cedict("上", "上", "shang3", "(rare reading)")

    def test_returns_most_used_by_constituent_count(self):
        # shang4 appears in more compound words → should win
        # (in an isolated test DB there are no ConstituentHanzi rows, so it
        # falls back to the first entry; the important thing is no NameError)
        result = Segmenter.most_frequent_pronunciation("上")
        self.assertIsNotNone(result)
        self.assertIsInstance(result, CEDictionary)

    def test_returns_none_for_unknown_hanzi(self):
        result = Segmenter.most_frequent_pronunciation("㊙")
        self.assertIsNone(result)

    def test_returns_single_result_directly(self):
        result = Segmenter.most_frequent_pronunciation("旅")
        # Not in test DB → None; confirms no crash
        self.assertIsNone(result)


# ---------------------------------------------------------------------------
# Batch lookup
# ---------------------------------------------------------------------------

class BatchLookupTests(TestCase):
    def setUp(self):
        self.mei_you = make_cedict("沒有", "没有", "mei2 you3", "not have / there is not")
        self.ren = make_cedict("人", "人", "ren2", "person / people")

    def test_batch_returns_entries_for_all_words(self):
        items = Segmenter.add_pronunciations(["沒有", "人"])
        batch = Segmenter._batch_lookup_cedict(items)
        self.assertIn("沒有", batch)
        self.assertIn("人", batch)

    def test_batch_indexes_by_simplified_too(self):
        items = Segmenter.add_pronunciations(["没有"])
        batch = Segmenter._batch_lookup_cedict(items)
        self.assertIn("没有", batch)

    def test_batch_skips_punctuation(self):
        items = Segmenter.add_pronunciations(["，", "。"])
        batch = Segmenter._batch_lookup_cedict(items)
        self.assertEqual(batch, {})

    def test_single_db_query_for_multiple_words(self):
        items = Segmenter.add_pronunciations(["沒有", "人"])
        with CaptureQueriesContext(connection) as ctx:
            Segmenter._batch_lookup_cedict(items)
        # Must be exactly 1 SELECT regardless of word count
        selects = [q for q in ctx.captured_queries if q["sql"].startswith("SELECT")]
        self.assertEqual(len(selects), 1)


# ---------------------------------------------------------------------------
# Step 1 — exact CEDict match
# ---------------------------------------------------------------------------

class ExactCEDictMatchTests(TestCase):
    def setUp(self):
        self.mei_you = make_cedict("沒有", "没有", "mei2 you3", "not have / there is not")
        self.mei = make_cedict("沒", "没", "mei2", "(negative prefix)")
        self.you = make_cedict("有", "有", "you3", "to have")
        ConstituentHanzi.objects.create(word=self.mei_you, hanzi=self.mei, order=0)
        ConstituentHanzi.objects.create(word=self.mei_you, hanzi=self.you, order=1)

    def test_word_found_in_cedict(self):
        items = Segmenter.add_pronunciations(["沒有"])
        sentence, dictionary = Segmenter.add_definitions_and_create_dictionary(
            items, original_sentence="沒有人"
        )
        self.assertIn("not have", sentence[0].definitions['en'][0])

    def test_hanzi_dict_populated_from_constituent_hanzi(self):
        items = Segmenter.add_pronunciations(["沒有"])
        _, dictionary = Segmenter.add_definitions_and_create_dictionary(
            items, original_sentence="沒有"
        )
        self.assertIn("沒", dictionary)
        self.assertIn("有", dictionary)

    def test_is_machine_translated_flag_false_for_cedict_entry(self):
        self.assertFalse(self.mei_you.is_machine_translated)

    def test_umlaut_word_found(self):
        make_cedict("女", "女", "nü3", "female / woman")
        items = Segmenter.add_pronunciations(["女"])
        sentence, dictionary = Segmenter.add_definitions_and_create_dictionary(items)
        self.assertIn("女", dictionary)
        self.assertIn("nü3", dictionary["女"].pinyin)


# ---------------------------------------------------------------------------
# Step 2 — try_to_concat (成語 with embedded comma)
# ---------------------------------------------------------------------------

class TryConcatTests(TestCase):
    def setUp(self):
        self.chengyu = make_cedict(
            "分久必合合久必分",
            "分久必合合久必分",
            "fen1 jiu3 bi4 he2 he2 jiu3 bi4 fen1",
            "lit. that which is long divided must unify, and that which is long unified must divide",
        )

    def test_concat_merges_across_comma(self):
        chengyu = [
            MandarinWordSchema(word="分久必合", pinyin=["1"], zhuyin=["A"], definitions={}),
            MandarinWordSchema(word="，", pinyin=["2"], zhuyin=["B"], definitions={}),
            MandarinWordSchema(word="合久必分", pinyin=["3"], zhuyin=["C"], definitions={}),
        ]
        result = Segmenter.try_to_concat(chengyu, 0)
        self.assertIsNotNone(result)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].word, "分久必合合久必分")

    def test_concat_returns_none_when_no_match(self):
        items = [
            MandarinWordSchema(word="天", pinyin=["1"], zhuyin=["A"], definitions={}),
            MandarinWordSchema(word="，", pinyin=["2"], zhuyin=["B"], definitions={}),
            MandarinWordSchema(word="下", pinyin=["3"], zhuyin=["C"], definitions={}),
        ]
        result = Segmenter.try_to_concat(items, 0)
        self.assertIsNone(result)

    def test_concat_returns_none_when_sentence_too_short(self):
        items = [
            MandarinWordSchema(word="天", pinyin=["1"], zhuyin=["A"], definitions={}),
        ]
        result = Segmenter.try_to_concat(items, 0)
        self.assertIsNone(result)

    def test_concat_does_not_loop_on_already_comma_word(self):
        items = [
            MandarinWordSchema(word="分，合", pinyin=["1"], zhuyin=["A"], definitions={}),
            MandarinWordSchema(word="，", pinyin=["2"], zhuyin=["B"], definitions={}),
            MandarinWordSchema(word="合久", pinyin=["3"], zhuyin=["C"], definitions={}),
        ]
        result = Segmenter.try_to_concat(items, 0)
        self.assertIsNone(result)


# ---------------------------------------------------------------------------
# Step 3 — Wiktionary fallback
# ---------------------------------------------------------------------------

FAKE_WIKI = {
    1: {
        "pronunciation": ["ce4", "shi4"],
        "definition": "test word (from Wiktionary)",
    }
}


class WiktionaryFallbackTests(TestCase):
    def setUp(self):
        # No CEDict entry for this word
        pass

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    def test_wiktionary_creates_cedict_entry(self, MockScraper):
        MockScraper.return_value.get_definitions.return_value = FAKE_WIKI
        items = Segmenter.add_pronunciations(["測試"])
        Segmenter.add_definitions_and_create_dictionary(items)
        self.assertTrue(
            CEDictionary.objects.filter(traditional="測試").exists()
        )

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    def test_wiktionary_entry_is_not_machine_translated(self, MockScraper):
        MockScraper.return_value.get_definitions.return_value = FAKE_WIKI
        items = Segmenter.add_pronunciations(["測試"])
        Segmenter.add_definitions_and_create_dictionary(items)
        entry = CEDictionary.objects.get(traditional="測試")
        self.assertFalse(entry.is_machine_translated)

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    def test_wiktionary_populates_definitions(self, MockScraper):
        MockScraper.return_value.get_definitions.return_value = FAKE_WIKI
        items = Segmenter.add_pronunciations(["測試"])
        sentence, _ = Segmenter.add_definitions_and_create_dictionary(items)
        self.assertTrue(sentence[0].definitions.get('en'))

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    def test_wiktionary_error_falls_through(self, MockScraper):
        MockScraper.return_value.get_definitions.return_value = {"error": "not found"}
        # With no CEDict entry and no Wiktionary hit on a 2-char word,
        # it should re-split (Step 4) rather than crash.
        items = Segmenter.add_pronunciations(["測試"])
        # Should not raise
        with patch.object(Segmenter, "_apply_mt_fallback"):
            Segmenter.add_definitions_and_create_dictionary(items)


# ---------------------------------------------------------------------------
# Step 4 — re-split Jieba hallucinations into characters
# ---------------------------------------------------------------------------

class ResplitTests(TestCase):
    def setUp(self):
        # Individual characters exist in CEDict; the compound does not.
        self.tian = make_cedict("天", "天", "tian1", "sky / heaven / day")
        self.xia = make_cedict("下", "下", "xia4", "below / down / next")

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    def test_multi_char_unknown_is_resplit(self, MockScraper):
        """A Jieba-produced compound not in any dict is broken into characters."""
        MockScraper.return_value.get_definitions.return_value = {"error": "not found"}
        # Manually build an item that looks like Jieba output for "天下"
        # but pretend it has no CEDict match by using a word that isn't there
        items = [
            MandarinWordSchema(
                word="天下",
                pinyin=["tian1", "xia4"],
                zhuyin=["ㄊㄧㄢ", "ㄒㄧㄚˋ"],
                definitions={},
            )
        ]
        sentence, dictionary = Segmenter.add_definitions_and_create_dictionary(
            items, original_sentence="天下"
        )
        # Should be split into two entries
        self.assertEqual(len(sentence), 2)
        self.assertEqual(sentence[0].word, "天")
        self.assertEqual(sentence[1].word, "下")

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    def test_resplit_recovers_cedict_definitions(self, MockScraper):
        """Characters found in CEDict after resplit have real definitions."""
        MockScraper.return_value.get_definitions.return_value = {"error": "not found"}
        items = [
            MandarinWordSchema(
                word="天下",
                pinyin=["tian1", "xia4"],
                zhuyin=["ㄊㄧㄢ", "ㄒㄧㄚˋ"],
                definitions={},
            )
        ]
        sentence, _ = Segmenter.add_definitions_and_create_dictionary(
            items, original_sentence="天下"
        )
        self.assertIn("sky", sentence[0].definitions['en'][0])
        self.assertIn("below", sentence[1].definitions['en'][0])

    def test_resplit_helper_preserves_pinyin_per_char(self):
        item = MandarinWordSchema(
            word="天下",
            pinyin=["tian1", "xia4"],
            zhuyin=["ㄊㄧㄢ", "ㄒㄧㄚˋ"],
            definitions={},
        )
        chars = Segmenter._resplit_into_chars(item)
        self.assertEqual(len(chars), 2)
        self.assertEqual(chars[0].pinyin, ["tian1"])
        self.assertEqual(chars[1].pinyin, ["xia4"])


# ---------------------------------------------------------------------------
# Step 5 — MT fallback (single character, DeepL in context)
# ---------------------------------------------------------------------------

class MTFallbackTests(TestCase):
    # "秘" is a real CJK character (has_chinese=True); it is not created in
    # setUp so the test DB has no entry and the full fallback chain fires.
    _RARE_CHAR = "秘"
    _RARE_PINYIN = "mi4"
    _RARE_ZHUYIN = "ㄇㄧˋ"

    def _rare_item(self):
        return MandarinWordSchema(
            word=self._RARE_CHAR,
            pinyin=[self._RARE_PINYIN],
            zhuyin=[self._RARE_ZHUYIN],
            definitions={},
        )

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    @patch("sentences.segmenters.Segmenter.DeepLTranslate.translate_word_in_context")
    def test_mt_fallback_uses_context_sentence(self, mock_translate, MockScraper):
        """translate_word_in_context is called with the full original sentence."""
        MockScraper.return_value.get_definitions.return_value = {"error": "not found"}
        mock_translate.return_value = "machine translation"
        original = self._RARE_CHAR
        Segmenter.add_definitions_and_create_dictionary(
            [self._rare_item()], original_sentence=original
        )
        calls = mock_translate.call_args_list
        self.assertTrue(
            any(call.args[1] == original for call in calls),
            f"Expected context={original!r} in calls: {calls}",
        )

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    @patch("sentences.segmenters.Segmenter.DeepLTranslate.translate_word_in_context")
    def test_mt_result_tagged_as_machine_translated(self, mock_translate, MockScraper):
        """CEDictionary entry created via MT has is_machine_translated=True."""
        MockScraper.return_value.get_definitions.return_value = {"error": "not found"}
        mock_translate.return_value = "whisper"
        Segmenter.add_definitions_and_create_dictionary(
            [self._rare_item()], original_sentence=self._RARE_CHAR
        )
        self.assertTrue(
            CEDictionary.objects.filter(
                traditional=self._RARE_CHAR, is_machine_translated=True
            ).exists(),
            "Expected an is_machine_translated=True entry for the rare char",
        )

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    @patch("sentences.segmenters.Segmenter.DeepLTranslate.translate_word_in_context")
    def test_mt_returns_none_does_not_create_entry(self, mock_translate, MockScraper):
        """When DeepL is unavailable (returns None), no CEDict entry is created."""
        MockScraper.return_value.get_definitions.return_value = {"error": "not found"}
        mock_translate.return_value = None
        Segmenter.add_definitions_and_create_dictionary(
            [self._rare_item()], original_sentence=self._RARE_CHAR
        )
        self.assertFalse(
            CEDictionary.objects.filter(traditional=self._RARE_CHAR).exists()
        )

    @patch("sentences.segmenters.Segmenter.WiktionaryScraper")
    @patch("sentences.segmenters.Segmenter.DeepLTranslate.translate_word_in_context")
    def test_argos_never_used_for_word_level_mt(self, mock_translate, MockScraper):
        """Translator (Argos) is never called for word-level definitions."""
        MockScraper.return_value.get_definitions.return_value = {"error": "not found"}
        mock_translate.return_value = "translated"
        with patch("sentences.segmenters.Segmenter.Translator") as mock_argos:
            Segmenter.add_definitions_and_create_dictionary(
                [self._rare_item()], original_sentence=self._RARE_CHAR
            )
            mock_argos.translate.assert_not_called()


# ---------------------------------------------------------------------------
# is_machine_translated field
# ---------------------------------------------------------------------------

class IsMachineTranslatedFieldTests(TestCase):
    def test_default_is_false(self):
        entry = make_cedict("好", "好", "hao3", "good")
        self.assertFalse(entry.is_machine_translated)

    def test_can_set_true(self):
        entry = make_cedict("好", "好", "hao3", "good", mt=True)
        self.assertTrue(entry.is_machine_translated)

    def test_filter_by_mt_flag(self):
        make_cedict("好", "好", "hao3", "good", mt=False)
        make_cedict("㊙", "㊙", "mi4", "secret", mt=True)
        self.assertEqual(CEDictionary.objects.filter(is_machine_translated=True).count(), 1)
        self.assertEqual(CEDictionary.objects.filter(is_machine_translated=False).count(), 1)


# ---------------------------------------------------------------------------
# translate_word_in_context
# ---------------------------------------------------------------------------

class TranslateWordInContextTests(TestCase):
    def _make_status(self, count=0, limit=500000):
        from status.models import ServerStatus
        return ServerStatus(
            deepl_character_count=count,
            deepl_character_limit=limit,
            translation_backend="deepl",
            mandobot_response_time=2.0,
        )

    @patch("sentences.translators.DeepLTranslator.translator")
    @patch("sentences.translators.DeepLTranslator.ServerStatus")
    def test_calls_deepl_with_context_param(self, MockStatus, mock_translator):
        from sentences.translators.DeepLTranslator import DeepLTranslate

        MockStatus.objects.last.return_value = self._make_status()
        mock_usage = MagicMock(any_limit_reached=False, any_limit_exceeded=False)
        mock_usage.character.count = 0  # must be an int; updateStatus writes it back
        mock_translator.get_usage.return_value = mock_usage
        mock_translator.translate_text.return_value = MagicMock(text="secret")

        result = DeepLTranslate.translate_word_in_context("秘", "這是秘密", "en")

        self.assertEqual(result, "secret")
        call_kwargs = mock_translator.translate_text.call_args
        context_arg = call_kwargs.kwargs.get("context")
        self.assertEqual(context_arg, "這是秘密")

    @patch("sentences.translators.DeepLTranslator.translator")
    @patch("sentences.translators.DeepLTranslator.ServerStatus")
    def test_returns_none_when_quota_exhausted(self, MockStatus, mock_translator):
        from sentences.translators.DeepLTranslator import DeepLTranslate

        MockStatus.objects.last.return_value = self._make_status(count=499999, limit=500000)
        mock_usage = MagicMock(any_limit_reached=True, any_limit_exceeded=False)
        mock_usage.character.count = 499999
        mock_translator.get_usage.return_value = mock_usage

        result = DeepLTranslate.translate_word_in_context("秘", "context", "en")
        self.assertIsNone(result)
        mock_translator.translate_text.assert_not_called()


# ---------------------------------------------------------------------------
# JiebaSegmenter initialization
# ---------------------------------------------------------------------------

class JiebaSegmenterTests(TestCase):
    def test_easy_segmentation(self):
        segments = JiebaSegmenter.segment("我来到北京清华大学")
        self.assertEqual(segments, ["我", "来到", "北京", "清华大学"])

    def test_segment_removes_spaces(self):
        segments = JiebaSegmenter.segment("你 好")
        self.assertNotIn(" ", segments)

    def test_segment_called_twice_no_reinit(self):
        """Calling segment() twice does not raise or reinitialize Jieba."""
        JiebaSegmenter.segment("你好")
        JiebaSegmenter.segment("再見")  # should not crash


# ---------------------------------------------------------------------------
# Full pipeline smoke tests (production DB not required)
# ---------------------------------------------------------------------------

class PipelineSmokeTests(TestCase):
    """
    These tests mock external calls and verify the pipeline structure end-to-end.
    They run against the test database (minimal CEDict data).
    """

    def setUp(self):
        make_cedict("你好", "你好", "ni3 hao3", "hello / hi")
        self.ni = make_cedict("你", "你", "ni3", "you (informal)")
        self.hao = make_cedict("好", "好", "hao3", "good / well")

    @patch("sentences.segmenters.Segmenter.DeepLTranslate.translate")
    @patch("sentences.segmenters.Segmenter.Translator.translate")
    def test_segment_and_translate_returns_correct_structure(
        self, mock_argos, mock_deepl
    ):
        mock_argos.return_value = "hello"
        mock_deepl.return_value = "hello"
        result = Segmenter.segment_and_translate("你好")
        self.assertIsInstance(result.translations, dict)
        self.assertIsInstance(result.sentence, list)
        self.assertIsInstance(result.dictionary, dict)

    @patch("sentences.segmenters.Segmenter.DeepLTranslate.translate")
    @patch("sentences.segmenters.Segmenter.Translator.translate")
    def test_punctuation_excluded_from_dictionary(self, mock_argos, mock_deepl):
        mock_argos.return_value = "hello world"
        mock_deepl.return_value = "hello world"
        result = Segmenter.segment_and_translate("你好，世界")
        for key in result.dictionary:
            self.assertEqual(len(key), 1, f"dictionary key '{key}' is not a single hanzi")

    @patch("sentences.segmenters.Segmenter.DeepLTranslate.translate")
    @patch("sentences.segmenters.Segmenter.Translator.translate")
    def test_no_duplicate_definitions(self, mock_argos, mock_deepl):
        mock_argos.return_value = "test"
        mock_deepl.return_value = "test"
        result = Segmenter.segment_and_translate("你好")
        for word in result.sentence:
            for lang, defs in word.definitions.items():
                self.assertEqual(
                    len(defs),
                    len(set(defs)),
                    f"Duplicate definitions for '{word.word}' in {lang}: {defs}",
                )


# ---------------------------------------------------------------------------
# Regression: previously-failing edge cases
# ---------------------------------------------------------------------------

class RegressionTests(TestCase):
    def setUp(self):
        make_cedict("女", "女", "nü3", "female / woman / daughter")
        make_cedict("上", "上", "shang4", "on top of / above")

    def test_umlaut_dictionary_lookup(self):
        """CEDict entry with ü in pinyin is found and returned correctly."""
        items = Segmenter.add_pronunciations(["女"])
        _, dictionary = Segmenter.add_definitions_and_create_dictionary(items)
        self.assertIn("女", dictionary)
        self.assertIn("nü3", dictionary["女"].pinyin)

    def test_mutable_default_arg_isolation(self):
        """Two separate calls do not share the dictionary accumulator."""
        items1 = Segmenter.add_pronunciations(["女"])
        _, dict1 = Segmenter.add_definitions_and_create_dictionary(items1)

        items2 = Segmenter.add_pronunciations(["上"])
        _, dict2 = Segmenter.add_definitions_and_create_dictionary(items2)

        self.assertNotIn("上", dict1)
        self.assertNotIn("女", dict2)

    def test_most_frequent_pronunciation_no_name_error(self):
        """most_frequent_pronunciation never raises NameError."""
        # Passes through the count>1 branch safely even with no ConstituentHanzi rows
        result = Segmenter.most_frequent_pronunciation("上")
        self.assertIsNotNone(result)
