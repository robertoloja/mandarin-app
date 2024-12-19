import jieba
import os
from typing import List

from mandoBot.settings import BASE_DIR

class JiebaSegmenter:
    dictionary_initialized = False

    @staticmethod
    def segment(sentence: str) -> List[str]:
        if not JiebaSegmenter.dictionary_initialized:
            dictionary_path = os.path.join(BASE_DIR, 'sentences/~cedict_edited_for_jieba.u8') #TODO: Rename file
            jieba.load_userdict(dictionary_path)
            JiebaSegmenter.dictionary_initialized = True

        segments = jieba.cut(sentence, cut_all=False)
        clean_segments = filter(lambda x: x != ' ', segments)
        return list(clean_segments)


DefaultSegmenter = JiebaSegmenter