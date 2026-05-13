import os
from typing import List
from mandoBot.settings import BASE_DIR
import jieba

_MAIN_DICT = os.path.join(BASE_DIR, "sentences/segmenters/dict.big.txt")
_USER_DICT = os.path.join(BASE_DIR, "sentences/segmenters/cedict_jieba.txt")
_USER_DICT_META = _USER_DICT + ".meta"

_initialized = False


def _ensure_initialized() -> None:
    global _initialized
    if _initialized:
        return
    jieba.set_dictionary(_MAIN_DICT)
    jieba.initialize()
    if os.path.exists(_USER_DICT):
        jieba.load_userdict(_USER_DICT)
    _initialized = True


def build_cedict_user_dict() -> None:
    """
    Export every word in CEDictionary to a Jieba user-dict file so that
    Jieba prefers segmentations that match known vocabulary.

    The file is regenerated only when the CEDictionary row-count changes.
    Both traditional and simplified forms are written as separate entries.
    """
    from sentences.models import CEDictionary

    current_count = CEDictionary.objects.count()

    if os.path.exists(_USER_DICT_META):
        with open(_USER_DICT_META) as fh:
            if fh.read().strip() == str(current_count):
                return  # already up to date

    with open(_USER_DICT, "w", encoding="utf-8") as fh:
        seen: set[str] = set()
        for trad, simp in CEDictionary.objects.values_list("traditional", "simplified").iterator():
            for form in {trad, simp}:
                if form not in seen:
                    seen.add(form)
                    fh.write(f"{form} 50000 nz\n")

    with open(_USER_DICT_META, "w") as fh:
        fh.write(str(current_count))

    global _initialized
    _initialized = False  # force reload on next segment call


class JiebaSegmenter:
    @staticmethod
    def segment(sentence: str) -> List[str]:
        _ensure_initialized()
        segments = jieba.cut(sentence, cut_all=False)
        return [x for x in segments if x != " "]
