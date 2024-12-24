import os
from typing import List
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import Manager, Lock

import jieba
from dragonmapper import hanzi, transcriptions

from mandoBot.settings import BASE_DIR
from sentences.translators import DefaultTranslator, initialize_translator

manager = Manager()
segmenter_initialized = manager.Value('b', False)
segmenter_lock = Lock()
segmenter = None

def initialize_segmenter():
    global segmenter
    with segmenter_lock:
        if not segmenter_initialized.value:
            print("SEGMENTER")
            dictionary_path = os.path.join(BASE_DIR, 'sentences/~cedict_edited_for_jieba.u8') #TODO: Rename file
            jieba.load_userdict(dictionary_path)
            jieba.initialize()
            segmenter_initialized.value = True
            segmenter = JiebaSegmenter()



class Segmenter:
    def segment_and_translate(sentence: str) -> dict:
        initialize_translator()
        initialize_segmenter()
        with ProcessPoolExecutor() as executor:
            future_segmented = executor.submit(DefaultSegmenter.segment, sentence)
            future_translation = executor.submit(DefaultTranslator.translate, sentence)

            segmented = future_segmented.result()
            translated = future_translation.result()

        # In zhuyin, the individual hanzi are space delimited already, 
        # while in pinyin the whole word is together.
        pronunciation = list(map(lambda x: hanzi.to_zhuyin(x), segmented))
        response = []

        for i in range(len(segmented)):
            pinyin = ''

            if hanzi.has_chinese(segmented[i]):
                pinyin = [transcriptions.zhuyin_to_pinyin(x) for x in pronunciation[i].split(' ')]
            else:
                pinyin = [segmented[i]] # this is punctuation, digits, etc.

            response += [{
                'word': segmented[i],
                'pinyin': pinyin,
                'definitions': [],
                'dictionary': {'english': 'english', 'pinyin': 'pinyin', 'simplified': 'simplified'} #TODO: Get rid of placeholders
            }]

        return {
            "translation": translated,
            "dictionary": {},
            "sentence": response
        }


class JiebaSegmenter(Segmenter):
    def segment(sentence: str) -> List[str]:
        segments = jieba.cut(sentence, cut_all=False)
        clean_segments = filter(lambda x: x != ' ', segments)
        return list(clean_segments)

DefaultSegmenter = JiebaSegmenter
