import jieba
import os
from typing import List

from dragonmapper import hanzi

from mandoBot.settings import BASE_DIR
from sentences.translators import DefaultTranslator

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

DefaultSegmenter = JiebaSegmenter # So that other segmenters can be plugged in

def segment_and_translate(sentence: str) -> dict:
    segmented = DefaultSegmenter.segment(sentence)
    pinyin = hanzi.to_pinyin('|'.join(segmented), delimiter='|').split('|')
    translated = []

    for i in range(len(segmented)):
        translated += [{
            'word': segmented[i],
            'pinyin': pinyin[i], # this is wrong, it needs to perform this at the sentence level
            'definitions': [],
            'dictionary': {'english': 'english', 'pinyin': 'pinyin', 'simplified': 'simplified'}
        }]

    return {
        "translation": DefaultTranslator.translate(sentence),
        "dictionary": {},
        "sentence": translated
    }

DefaultSegmenter.segment_and_translate = staticmethod(segment_and_translate)
