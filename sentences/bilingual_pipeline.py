"""
Core bilingual pipeline: given a segmented sentence[] and dictionary{} (in the
legacy SegmentationResponse shape), and a German full-text translation, produces
a ReadingRoomChapter-compatible data dict with shape:

    {
        "translation": {"en": str, "de": str},
        "sentence": [
            {"word": str, "pinyin": [str], "zhuyin": [str],
             "definitions": {"en": [str], "de": [str]}}
        ],
        "dictionary": {
            hanzi: {"en": [str], "de": [str], "pinyin": [str], "zhuyin": [str]}
        }
    }

The German word-level definitions are looked up from CEDefinition via the same
4-step cascade used in populate_json_german_definitions.py.
"""

from django.db.models import Q
from sentences.models.CEDictionary import CEDictionary
from sentences.models.CEDefinition import CEDefinition
from sentences.models.ConstituentHanzi import ConstituentHanzi


# ── Pinyin normalisation ──────────────────────────────────────────────────────

def normalize_pinyin(pinyin: str) -> str:
    """Replace ü with u: to match how CEDICT stores umlaut pinyin."""
    return pinyin.replace('ü', 'u:')


# ── Single-entry helpers ──────────────────────────────────────────────────────

def de_from_cedict(cedict: CEDictionary) -> list | None:
    """Return German definitions for a single CEDictionary entry, or None."""
    try:
        de_def = CEDefinition.objects.get(cedict=cedict, language='de')
        return [d.strip() for d in de_def.definitions.split(' / ') if d.strip()]
    except CEDefinition.DoesNotExist:
        return None


def most_frequent(candidates) -> CEDictionary:
    """
    Among a queryset of CEDictionary entries, return the one that appears most
    often as a ConstituentHanzi (mirrors Segmenter.most_frequent_pronunciation).
    """
    best, best_count = candidates.first(), 0
    for candidate in candidates:
        count = ConstituentHanzi.objects.filter(hanzi=candidate).count()
        if count > best_count:
            best_count = count
            best = candidate
    return best


def find_cedict(hanzi: str, pinyin_list: list) -> CEDictionary | None:
    """
    Resolve hanzi + pinyin list to a single CEDictionary entry.

    4-step cascade:
      1. Exact pronunciation (ü normalised)
      2. Neutral-tone: strip trailing 5, pick by ConstituentHanzi frequency
      3. Pronunciation prefix (tone digit stripped entirely)
      4. Hanzi only (no pinyin filter)
    """
    pronunciation = normalize_pinyin(' '.join(pinyin_list))
    base_q = Q(traditional=hanzi) | Q(simplified=hanzi)

    # Step 1 — exact
    qs = CEDictionary.objects.filter(base_q, pronunciation=pronunciation)
    if qs.count() == 1:
        return qs.first()
    if qs.count() > 1:
        return most_frequent(qs)

    # Step 2 — neutral-tone
    syllables = pronunciation.split()
    if any(s.endswith('5') for s in syllables):
        bare_syllables = [s[:-1] if s.endswith('5') else s for s in syllables]
        qs = CEDictionary.objects.filter(base_q)
        for bare in bare_syllables:
            if not bare + '5' in syllables:
                continue
            qs = qs.filter(pronunciation__contains=bare)
        if qs.count() == 1:
            return qs.first()
        if qs.count() > 1:
            return most_frequent(qs)

    # Step 3 — strip tone digits
    no_tone = ' '.join(s[:-1] if s and s[-1].isdigit() else s for s in syllables)
    qs = CEDictionary.objects.filter(base_q, pronunciation__istartswith=no_tone.split()[0])
    if qs.count() == 1:
        return qs.first()
    if qs.count() > 1:
        return most_frequent(qs)

    # Step 4 — hanzi only
    qs = CEDictionary.objects.filter(base_q)
    if qs.count() == 1:
        return qs.first()
    if qs.count() > 1:
        return most_frequent(qs)

    return None


def lookup_german(hanzi: str, pinyin_list: list) -> list | None:
    """
    Full German lookup: direct HanDeDict hit → ConstituentHanzi chain →
    character-by-character fallback. Composed definitions prefixed with
    'ZUSAMMENGESETZT:'.
    """
    cedict = find_cedict(hanzi, pinyin_list)

    if cedict:
        result = de_from_cedict(cedict)
        if result:
            return result

        constituents = cedict.get_hanzi()
        if constituents:
            parts = []
            for ch in constituents:
                de = de_from_cedict(ch)
                if de:
                    parts.append(de[0])
                else:
                    parts = []
                    break
            if parts:
                return [f'ZUSAMMENGESETZT: {" / ".join(parts)}']

    if len(hanzi) > 1:
        parts = []
        for i, char in enumerate(hanzi):
            char_pinyin = [pinyin_list[i]] if i < len(pinyin_list) else []
            char_cedict = find_cedict(char, char_pinyin)
            if char_cedict:
                de = de_from_cedict(char_cedict)
                if de:
                    parts.append(de[0])
                    continue
            parts = []
            break
        if parts:
            return [f'ZUSAMMENGESETZT: {" / ".join(parts)}']

    return None


# ── Pre-segmented ingest pipeline ─────────────────────────────────────────────

def _parse_segmented_input(text: str) -> list[str]:
    """
    Parse a textarea of space-separated Chinese tokens into a flat token list.

    Blank lines become paragraph-break sentinels (empty string '').
    Single newlines and spaces are treated as token separators within a paragraph.
    """
    import re
    text = re.sub(r'\r\n|\r', '\n', text)
    paragraphs = re.split(r'\n[ \t]*\n', text.strip())
    result: list[str] = []
    for i, paragraph in enumerate(paragraphs):
        result.extend(paragraph.split())
        if i < len(paragraphs) - 1:
            result.append('')
    return result


def build_chapter_data_from_tokens(
    tokens: list[str],
    english_translation: str,
    german_translation: str,
) -> dict:
    """
    Build ReadingRoomChapter data from a pre-tokenized list of Chinese words.

    Tokens are plain strings (words or punctuation). An empty string becomes
    a paragraph-break sentinel. Pronunciations are derived via dragonmapper;
    English and German definitions are looked up from the database.
    """
    import re
    from dragonmapper import hanzi as hanzi_utils
    from sentences.functions import is_punctuation

    def _pinyin_to_zhuyin(pinyin: str) -> str:
        if ':' not in pinyin:
            return hanzi_utils.pinyin_to_zhuyin(pinyin)
        number = pinyin[-1]
        return hanzi_utils.pinyin_to_zhuyin(pinyin[:-3] + 'ü' + number)

    sentence_out = []
    dictionary_out = {}

    for token in tokens:
        if token == '':
            sentence_out.append({'word': '\n', 'pinyin': [], 'zhuyin': [], 'definitions': {}})
            continue

        if not hanzi_utils.has_chinese(token) or is_punctuation(token):
            sentence_out.append({
                'word': token,
                'pinyin': [token],
                'zhuyin': [token],
                'definitions': {},
            })
            continue

        raw_pinyin = hanzi_utils.to_pinyin(token, accented=False)
        pinyin = re.findall(r'[a-zA-Zü]+(?:\d+)?', raw_pinyin)
        zhuyin = [_pinyin_to_zhuyin(p) for p in pinyin]

        cedict = find_cedict(token, pinyin)
        if cedict:
            en_defs = [d.strip() for d in cedict.definitions.split('/') if d.strip()]
            de_defs = lookup_german(token, pinyin) or ['MISSING FROM HANDEDICT']
        else:
            from sentences.models import CustomDefinition
            custom, created = CustomDefinition.objects.get_or_create(
                word=token,
                defaults={'pinyin': pinyin},
            )
            en_defs = custom.definitions_en
            de_defs = custom.definitions_de

        sentence_out.append({
            'word': token,
            'pinyin': pinyin,
            'zhuyin': zhuyin,
            'definitions': {'en': en_defs, 'de': de_defs},
        })

        if cedict:
            constituents = cedict.get_hanzi()
            if constituents:
                for ch in constituents:
                    char = ch.traditional if token == cedict.traditional else ch.simplified
                    dictionary_out[char] = {
                        'en': [ch.definitions],
                        'de': de_from_cedict(ch) or [ch.definitions],
                        'pinyin': [ch.pronunciation.replace('u:', 'ü')],
                        'zhuyin': [_pinyin_to_zhuyin(ch.pronunciation)],
                    }
            else:
                for i, char in enumerate(token):
                    char_pinyin = [pinyin[i]] if i < len(pinyin) else []
                    char_cedict = find_cedict(char, char_pinyin)
                    if char_cedict:
                        dictionary_out[char] = {
                            'en': [char_cedict.definitions],
                            'de': de_from_cedict(char_cedict) or [char_cedict.definitions],
                            'pinyin': [char_cedict.pronunciation.replace('u:', 'ü')],
                            'zhuyin': [_pinyin_to_zhuyin(char_cedict.pronunciation)],
                        }

    return {
        'translation': {'en': english_translation, 'de': german_translation},
        'sentence': sentence_out,
        'dictionary': dictionary_out,
    }

