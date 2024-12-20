import jieba
import os
from typing import List

from dragonmapper import hanzi, transcriptions

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


'''
Below is the functionality that is shared by all segmenters.
'''
DefaultSegmenter = JiebaSegmenter

def segment_and_translate(sentence: str) -> dict:
    segmented = DefaultSegmenter.segment(sentence)
    pronunciation = list(map(lambda x: hanzi.to_zhuyin(x), segmented))
    translated = []

    for i in range(len(segmented)):
        pinyin = ''

        if hanzi.has_chinese(segmented[i]):
            pinyin = [transcriptions.zhuyin_to_pinyin(x) for x in pronunciation[i].split(' ')]
        else:
            pinyin = [segmented[i]] # this is punctuation, digits, etc.

        translated += [{
            'word': segmented[i],
            'pinyin': pinyin,
            'definitions': [],
            'dictionary': {'english': 'english', 'pinyin': 'pinyin', 'simplified': 'simplified'} #TODO: Get rid of placeholders
        }]

    return {
        "translation": DefaultTranslator.translate(sentence),
        "dictionary": {},
        "sentence": translated
    }

DefaultSegmenter.segment_and_translate = staticmethod(segment_and_translate)
