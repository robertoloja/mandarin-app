import re
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Tuple, Optional
from django.db.models import Q
from dragonmapper import hanzi as hanzi_utils

from mandoBot.schemas import ChineseDictionary, MandarinWordSchema, SegmentationResponse
from mandoBot.languages import SUPPORTED_LANGUAGES
from sentences.dictionaries import WiktionaryScraper
from sentences.models.CEDictionary import CEDictionary
from sentences.models.CEDefinition import CEDefinition
from sentences.models.ConstituentHanzi import ConstituentHanzi
from sentences.functions import is_punctuation
from sentences.translators import DeepLTranslate
from ..translators import Translator
from ..segmenters import JiebaSegmenter


class Segmenter:

    # ------------------------------------------------------------------ #
    # Public entry point                                                   #
    # ------------------------------------------------------------------ #

    @staticmethod
    def segment_and_translate(
        sentence: str, auth: bool = False
    ) -> SegmentationResponse:
        sentence = sentence.replace("　", "").strip()

        translator_fn = DeepLTranslate.translate if auth else Translator.translate

        with ThreadPoolExecutor() as executor:
            future_segmented = executor.submit(JiebaSegmenter.segment, sentence)
            future_translations = {
                lang: executor.submit(translator_fn, sentence, lang)
                for lang in SUPPORTED_LANGUAGES
            }

            segmented = future_segmented.result()
            translations = {lang: fut.result() for lang, fut in future_translations.items()}

        segmented_list: List[MandarinWordSchema] = Segmenter.add_pronunciations(segmented)
        segmented_sentence, dictionary = Segmenter.add_definitions_and_create_dictionary(
            segmented_list, original_sentence=sentence
        )

        return SegmentationResponse(
            translations=translations,
            sentence=segmented_sentence,
            dictionary=dictionary,
        )

    # ------------------------------------------------------------------ #
    # Pronunciation helpers                                                #
    # ------------------------------------------------------------------ #

    @staticmethod
    def add_pronunciations(segmented_sentence: List[str]) -> List[MandarinWordSchema]:
        pronunciation = [
            hanzi_utils.to_pinyin(x, accented=False) for x in segmented_sentence
        ]
        response: List[MandarinWordSchema] = []

        for i in range(len(segmented_sentence)):
            if hanzi_utils.has_chinese(segmented_sentence[i]) and not is_punctuation(
                segmented_sentence[i]
            ):
                pinyin = re.findall(r"[a-zA-Zü]+(?:\d+)?", pronunciation[i])
                zhuyin = [Segmenter.pinyin_to_zhuyin(x) for x in pinyin]
            else:
                pinyin = [segmented_sentence[i]]
                zhuyin = [segmented_sentence[i]]

            response.append(
                MandarinWordSchema(
                    word=segmented_sentence[i], pinyin=pinyin, zhuyin=zhuyin, definitions={}
                )
            )
        return response

    @staticmethod
    def pinyin_to_zhuyin(pinyin: str) -> str:
        """Convert a single-syllable pinyin string to zhuyin."""
        if ":" not in pinyin:
            return hanzi_utils.pinyin_to_zhuyin(pinyin)
        umlaut = "ü"
        number = pinyin[-1]
        return hanzi_utils.pinyin_to_zhuyin(pinyin[:-3] + umlaut + number)

    @staticmethod
    def most_frequent_pronunciation(hanzi5: str) -> Optional[CEDictionary]:
        """
        When a hanzi has a 5th (neutral) tone and we must guess the primary
        tone, return the entry most commonly used as a constituent hanzi.
        """
        hanzi_regular = CEDictionary.objects.filter(
            Q(traditional=hanzi5) | Q(simplified=hanzi5)
        )
        count = hanzi_regular.count()

        if count == 0:
            return None
        if count == 1:
            return hanzi_regular.first()

        most_common: Optional[CEDictionary] = hanzi_regular.first()
        max_count = 0
        for candidate in hanzi_regular:
            n = ConstituentHanzi.objects.filter(hanzi=candidate).count()
            if n > max_count:
                max_count = n
                most_common = candidate
        return most_common

    # ------------------------------------------------------------------ #
    # CEDict lookup helpers                                                #
    # ------------------------------------------------------------------ #

    @staticmethod
    def get_all_definitions(cedict_entry: CEDictionary) -> Dict[str, List[str]]:
        """Return definitions for all supported languages; German falls back to English."""
        en_def = cedict_entry.definitions
        try:
            de_entry = CEDefinition.objects.get(cedict=cedict_entry, language='de')
            de_def = de_entry.definitions
        except CEDefinition.DoesNotExist:
            de_def = en_def
        return {'en': [en_def], 'de': [de_def]}

    @staticmethod
    def _batch_lookup_cedict(
        items: List[MandarinWordSchema],
    ) -> Dict[str, List[CEDictionary]]:
        """
        Single DB query that fetches all candidate CEDict entries for every
        Chinese word in the sentence.  Returns a dict keyed by word text
        (both traditional and simplified keys point to the same entries).
        """
        words = {
            item.word
            for item in items
            if hanzi_utils.has_chinese(item.word) and not is_punctuation(item.word)
        }
        if not words:
            return {}

        q = Q()
        for word in words:
            q |= Q(traditional=word) | Q(simplified=word)

        by_word: Dict[str, List[CEDictionary]] = {}
        for entry in CEDictionary.objects.filter(q):
            for key in {entry.traditional, entry.simplified}:
                by_word.setdefault(key, []).append(entry)
        return by_word

    @staticmethod
    def _cedict_entries_for_item(
        item: MandarinWordSchema,
        batch: Dict[str, List[CEDictionary]],
    ) -> List[CEDictionary]:
        """
        Filter the batch result to entries whose pronunciation matches
        this item's pinyin and whose word_length matches.
        """
        pinyin_str = " ".join(item.pinyin).replace("ü", "u:")
        candidates = batch.get(item.word, [])
        return [
            e for e in candidates
            if e.pronunciation.lower() == pinyin_str.lower()
            and e.word_length == len(item.word)
        ]

    # ------------------------------------------------------------------ #
    # Dictionary population helpers                                        #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _apply_cedict_entries(
        item: MandarinWordSchema,
        entries: List[CEDictionary],
        dictionary: Dict[str, ChineseDictionary],
    ) -> None:
        """Populate item.definitions and the hanzi-level dictionary from CEDict entries."""
        for entry in entries:
            all_defs = Segmenter.get_all_definitions(entry)
            item.definitions = {
                lang: item.definitions.get(lang, []) + all_defs[lang]
                for lang in all_defs
            }
            constituent_hanzi = entry.get_hanzi()

            if constituent_hanzi:
                for single_hanzi in constituent_hanzi:
                    the_hanzi = (
                        single_hanzi.traditional
                        if item.word == entry.traditional
                        else single_hanzi.simplified
                    )
                    hanzi_all_defs = Segmenter.get_all_definitions(single_hanzi)
                    dictionary[the_hanzi] = ChineseDictionary(
                        en=hanzi_all_defs['en'],
                        de=hanzi_all_defs['de'],
                        pinyin=[single_hanzi.pronunciation.replace("u:", "ü")],
                        zhuyin=[Segmenter.pinyin_to_zhuyin(single_hanzi.pronunciation)],
                    )
            else:
                for idx, hanzi_char in enumerate(item.word):
                    the_hanzi, db_hanzi = Segmenter.attempt_to_get_hanzi(
                        hanzi_char, item, idx, entry
                    )
                    if db_hanzi is None:
                        continue
                    hanzi_all_defs = Segmenter.get_all_definitions(db_hanzi)
                    dictionary[the_hanzi] = ChineseDictionary(
                        en=hanzi_all_defs['en'],
                        de=hanzi_all_defs['de'],
                        pinyin=[db_hanzi.pronunciation.replace("u:", "ü")],
                        zhuyin=[Segmenter.pinyin_to_zhuyin(db_hanzi.pronunciation)],
                    )

    @staticmethod
    def _add_char_to_dictionary(
        char: str,
        pinyin: str,
        dictionary: Dict[str, ChineseDictionary],
    ) -> None:
        """Look up a single character and add it to the hanzi dictionary."""
        pinyin_search = pinyin.replace("ü", "u:")
        db_hanzi = CEDictionary.objects.filter(
            Q(traditional=char) | Q(simplified=char),
            pronunciation__iexact=pinyin_search,
            word_length=1,
        )
        if not db_hanzi.exists():
            db_hanzi = CEDictionary.objects.filter(
                Q(traditional=char) | Q(simplified=char),
                pronunciation__startswith=pinyin_search[:-1],
                word_length=1,
            )
        entry = db_hanzi.first() if db_hanzi.exists() else None
        if entry is not None:
            all_defs = Segmenter.get_all_definitions(entry)
            dictionary[char] = ChineseDictionary(
                en=all_defs['en'],
                de=all_defs['de'],
                pinyin=[entry.pronunciation.replace("u:", "ü")],
                zhuyin=[Segmenter.pinyin_to_zhuyin(entry.pronunciation)],
            )

    # ------------------------------------------------------------------ #
    # Fallback chain helpers                                               #
    # ------------------------------------------------------------------ #

    @staticmethod
    def try_to_concat(
        segmented_sentence: List[MandarinWordSchema], index: int
    ) -> Optional[List[MandarinWordSchema]]:
        """
        Try to merge the current word with the next across a comma, catching
        成語 stored in CEDict as two halves joined by '，'.
        """
        if (
            len(segmented_sentence[index:]) < 3
            or "，" in segmented_sentence[index].word
            or "," in segmented_sentence[index].word
            or len(segmented_sentence[index].word) > 8
        ):
            return None

        if segmented_sentence[index + 1].word in [",", "，"]:
            compounded_word = (
                segmented_sentence[index].word + segmented_sentence[index + 2].word
            )
            db_word = CEDictionary.objects.filter(
                Q(traditional=compounded_word) | Q(simplified=compounded_word)
            )
            if db_word.exists() and db_word.count() == 1:
                pinyin = (
                    segmented_sentence[index].pinyin
                    + [","]
                    + segmented_sentence[index + 2].pinyin
                )
                zhuyin = (
                    segmented_sentence[index].zhuyin
                    + [","]
                    + segmented_sentence[index + 2].zhuyin
                )
                merged = MandarinWordSchema(
                    word=compounded_word, pinyin=pinyin, zhuyin=zhuyin, definitions={}
                )
                return (
                    segmented_sentence[:index]
                    + [merged]
                    + segmented_sentence[index + 3:]
                )
        return None

    @staticmethod
    def _resplit_into_chars(item: MandarinWordSchema) -> List[MandarinWordSchema]:
        """
        Decompose a multi-character token into individual-character tokens.
        Used when Jieba produces a word that is not in CEDict or Wiktionary,
        which is a strong signal of a segmentation error.
        """
        result = []
        for j, char in enumerate(item.word):
            pinyin_j = item.pinyin[j] if j < len(item.pinyin) else char
            zhuyin_j = item.zhuyin[j] if j < len(item.zhuyin) else char
            result.append(
                MandarinWordSchema(
                    word=char, pinyin=[pinyin_j], zhuyin=[zhuyin_j], definitions={}
                )
            )
        return result

    @staticmethod
    def _apply_wiktionary(
        item: MandarinWordSchema,
        dictionary: Dict[str, ChineseDictionary],
    ) -> bool:
        """
        Try Wiktionary for the word.  On success, creates CEDict entries
        (is_machine_translated=False) and populates item.definitions.
        Returns True if definitions were found.
        """
        wiki_definitions = WiktionaryScraper().get_definitions(item.word)
        if not wiki_definitions or "error" in wiki_definitions:
            return False

        for key in wiki_definitions:
            pronunciation_str = " ".join(wiki_definitions[key]["pronunciation"])
            new_cedict = CEDictionary.objects.filter(
                traditional=item.word,
                simplified=item.word,
                pronunciation=pronunciation_str,
            )
            if not new_cedict.exists():
                new_cedict_obj = CEDictionary.objects.create(
                    traditional=item.word,
                    simplified=item.word,
                    pronunciation=pronunciation_str,
                    definitions=wiki_definitions[key]["definition"],
                    is_machine_translated=False,
                )
            elif new_cedict.count() > 1:
                new_cedict_obj = (
                    new_cedict
                    .filter(definitions=" / ".join([wiki_definitions[key]["definition"]]))
                    .first()
                )
            else:
                new_cedict_obj = new_cedict.first()

            if new_cedict_obj is None:
                continue

            if len(item.word) > 1:
                for i, char in enumerate(item.word):
                    wiki_pinyin = wiki_definitions[key]["pronunciation"][i]
                    h = CEDictionary.objects.filter(
                        pronunciation=wiki_pinyin, traditional=char
                    )
                    if h.count() == 0:
                        h = CEDictionary.objects.filter(
                            pronunciation__startswith=wiki_pinyin[:-1]
                        ).first()
                    elif h.count() > 1:
                        h = Segmenter.most_frequent_pronunciation(char)
                    else:
                        h = h.first()

                    if h:
                        ConstituentHanzi.objects.get_or_create(
                            word=new_cedict_obj, hanzi=h, order=i
                        )

        db_result = list(CEDictionary.objects.filter(
            Q(traditional=item.word) | Q(simplified=item.word)
        ))
        if db_result:
            Segmenter._apply_cedict_entries(item, db_result, dictionary)
        return bool(item.definitions.get('en'))

    @staticmethod
    def _apply_mt_fallback(
        item: MandarinWordSchema,
        original_sentence: str,
        dictionary: Dict[str, ChineseDictionary],
    ) -> None:
        """
        Last-resort: translate the word in context via DeepL (never Argos).
        Saves results to CEDict tagged as is_machine_translated=True so the
        dictionary can be audited and cleaned up separately.
        """
        mt_defs: Dict[str, List[str]] = {}
        for lang in SUPPORTED_LANGUAGES:
            result = DeepLTranslate.translate_word_in_context(
                item.word, original_sentence, lang
            )
            mt_defs[lang] = [result] if result else []

        item.definitions = mt_defs

        if any(mt_defs.values()):
            en_def = (mt_defs.get('en') or mt_defs.get('de') or [''])[0]
            pronunciation_str = " ".join(item.pinyin).replace("ü", "u:")
            CEDictionary.objects.get_or_create(
                traditional=item.word,
                simplified=item.word,
                pronunciation=pronunciation_str,
                defaults={
                    'definitions': en_def,
                    'is_machine_translated': True,
                },
            )

        for j, char in enumerate(item.word):
            pinyin_j = item.pinyin[j] if j < len(item.pinyin) else char
            Segmenter._add_char_to_dictionary(char, pinyin_j, dictionary)

    # ------------------------------------------------------------------ #
    # Main definition-building loop                                        #
    # ------------------------------------------------------------------ #

    @staticmethod
    def add_definitions_and_create_dictionary(
        segmented_sentence: List[MandarinWordSchema],
        original_sentence: str = "",
        dictionary: Optional[Dict[str, ChineseDictionary]] = None,
    ) -> Tuple[List[MandarinWordSchema], Dict[str, ChineseDictionary]]:
        if dictionary is None:
            dictionary = {}

        # One DB round-trip for all known words in the sentence.
        batch = Segmenter._batch_lookup_cedict(segmented_sentence)

        i = 0
        while i < len(segmented_sentence):
            item = segmented_sentence[i]

            if is_punctuation(item.word) or not hanzi_utils.has_chinese(item.word):
                item.definitions = {'en': [], 'de': []}
                i += 1
                continue

            if item.definitions:
                i += 1
                continue

            # ── Step 1: exact CEDict match ─────────────────────────────
            entries = Segmenter._cedict_entries_for_item(item, batch)
            if entries:
                Segmenter._apply_cedict_entries(item, entries, dictionary)
                i += 1
                continue

            # ── Step 2: try_to_concat (catches 成語 split by commas) ───
            concat_result = Segmenter.try_to_concat(segmented_sentence, i)
            if concat_result is not None:
                return Segmenter.add_definitions_and_create_dictionary(
                    concat_result, original_sentence, dictionary
                )

            # ── Step 3: Wiktionary ────────────────────────────────────
            if Segmenter._apply_wiktionary(item, dictionary):
                i += 1
                continue

            # ── Step 4: re-split multi-char token into characters ─────
            # A multi-char word unknown to CEDict and Wiktionary is almost
            # certainly a Jieba segmentation error.  Per-character lookup
            # recovers meaningful vocabulary for the learner.
            if len(item.word) > 1:
                char_items = Segmenter._resplit_into_chars(item)
                segmented_sentence = (
                    segmented_sentence[:i]
                    + char_items
                    + segmented_sentence[i + 1:]
                )
                # Refresh batch to cover the new single-char items.
                batch = Segmenter._batch_lookup_cedict(segmented_sentence)
                # Don't advance i — reprocess from position i (now a single char).
                continue

            # ── Step 5: contextual DeepL MT (single char only here) ───
            Segmenter._apply_mt_fallback(item, original_sentence, dictionary)
            i += 1

        return (segmented_sentence, dictionary)

    # ------------------------------------------------------------------ #
    # Legacy helper (used by _apply_cedict_entries)                       #
    # ------------------------------------------------------------------ #

    @staticmethod
    def attempt_to_get_hanzi(
        hanzi: str, item: MandarinWordSchema, index: int, entry: CEDictionary
    ) -> Tuple[str, Optional[CEDictionary]]:
        pinyin_search = (
            item.pinyin[index].replace("ü", "u:")
            if index < len(item.pinyin)
            else item.pinyin[0].replace("ü", "u:")
        )

        use_traditional = item.word == entry.traditional
        field = "traditional" if use_traditional else "simplified"

        for lookup in (
            {field: hanzi, "pronunciation": pinyin_search},
            {field: hanzi, "pronunciation__iexact": pinyin_search},
            {field: hanzi, "pronunciation": pinyin_search[:-1]},
            {field: hanzi},
        ):
            qs = CEDictionary.objects.filter(**lookup)
            first = qs.first()
            if first is not None:
                the_hanzi = first.traditional if use_traditional else first.simplified
                return the_hanzi, first

        return hanzi, None
