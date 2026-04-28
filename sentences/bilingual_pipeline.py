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


# ── Main pipeline ─────────────────────────────────────────────────────────────

def build_chapter_data(
    segmentation: dict,
    english_translation: str,
    german_translation: str,
) -> dict:
    """
    Convert a legacy SegmentationResponse dict (from SentenceHistory.json_data)
    into a ReadingRoomChapter data dict.

    Args:
        segmentation:          Parsed json_data from SentenceHistory — must have
                               'sentence' (list) and 'dictionary' (dict) keys.
        english_translation:   The English full-text translation (stored in
                               segmentation['translation']).
        german_translation:    The German full-text translation supplied by the
                               translator.

    Returns:
        A dict matching the ReadingRoomChapter.data shape.
    """
    sentence_out = []
    for word in segmentation.get('sentence', []):
        raw_defs = word.get('definitions', [])

        # Legacy shape: definitions is a flat list of English strings
        if isinstance(raw_defs, list):
            en_defs = raw_defs
        elif isinstance(raw_defs, dict):
            en_defs = raw_defs.get('en', [])
        else:
            en_defs = []

        pinyin = word.get('pinyin', [])

        if en_defs:
            de_defs = lookup_german(word.get('word', ''), pinyin) or ['MISSING FROM HANDEDICT']
        else:
            de_defs = []

        sentence_out.append({
            'word': word.get('word', ''),
            'pinyin': pinyin,
            'zhuyin': word.get('zhuyin', []),
            'definitions': {'en': en_defs, 'de': de_defs} if en_defs else {},
        })

    dictionary_out = {}
    for hanzi, entry in segmentation.get('dictionary', {}).items():
        # Legacy shape: entry has 'english' key (not 'en')
        if isinstance(entry, dict):
            en_defs = entry.get('en') or entry.get('english') or []
        else:
            en_defs = []

        pinyin = entry.get('pinyin', []) if isinstance(entry, dict) else []
        de_defs = lookup_german(hanzi, pinyin) or ['MISSING FROM HANDEDICT']

        dictionary_out[hanzi] = {
            'en': en_defs,
            'de': de_defs,
            'pinyin': pinyin,
            'zhuyin': entry.get('zhuyin', []) if isinstance(entry, dict) else [],
        }

    return {
        'translation': {
            'en': english_translation,
            'de': german_translation,
        },
        'sentence': sentence_out,
        'dictionary': dictionary_out,
    }
