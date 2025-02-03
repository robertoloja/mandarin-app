import os
from typing import List
from mandoBot.settings import BASE_DIR
import jieba


class JiebaSegmenter:
    @staticmethod
    def segment(sentence: str) -> List[str]:
        dictionary_path = os.path.join(BASE_DIR, "sentences/segmenters/dict.big.txt")
        jieba.set_dictionary(dictionary_path)
        jieba.initialize()

        segments = jieba.cut(sentence, cut_all=False)
        clean_segments: filter[str] = filter(lambda x: x != " ", segments)

        return list(clean_segments)
