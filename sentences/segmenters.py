import os
from typing import List
from concurrent.futures import ThreadPoolExecutor

import requests
import jieba
from dragonmapper import hanzi, transcriptions

from mandoBot.settings import BASE_DIR
from sentences.translators import DefaultTranslator


class Segmenter:
    @staticmethod
    def segment_and_translate(sentence: str) -> dict:
        with ThreadPoolExecutor() as executor:
            future_segmented = executor.submit(DefaultSegmenter.segment, sentence)
            future_translation = executor.submit(DefaultTranslator.translate, sentence)

            segmented = future_segmented.result()
            translated = future_translation.result()

        # In zhuyin, the individual hanzi are space delimited already,
        # while in pinyin the whole word is together.
        pronunciation = list(map(lambda x: hanzi.to_zhuyin(x), segmented))
        response = []

        for i in range(len(segmented)):
            pinyin = ""

            if hanzi.has_chinese(segmented[i]):
                pinyin = [
                    transcriptions.zhuyin_to_pinyin(x)
                    for x in pronunciation[i].split(" ")
                ]
            else:
                pinyin = [segmented[i]]  # this is punctuation, digits, etc.

            response += [
                {
                    "word": segmented[i],
                    "pinyin": pinyin,
                    "definitions": [],
                }
            ]

        return {"translation": translated, "sentence": response}


class JiebaSegmenter(Segmenter):
    dictionary_initialized = False

    @staticmethod
    def segment(sentence: str) -> List[str]:
        if not JiebaSegmenter.dictionary_initialized:
            dictionary_path = os.path.join(
                BASE_DIR, "sentences/~cedict_edited_for_jieba.u8"
            )  # TODO: Rename file
            jieba.load_userdict(dictionary_path)
            JiebaSegmenter.dictionary_initialized = True

        segments = jieba.cut(sentence, cut_all=False)
        clean_segments = filter(lambda x: x != " ", segments)
        return list(clean_segments)


class ExternalRenderAPISegmenter(Segmenter):
    @staticmethod
    def segment(sentence: str) -> List[str]:
        api_url = "https://segmenter.onrender.com/segment"

        try:
            response = requests.post(api_url, json={"text": sentence})
            response.raise_for_status()
            return response.json().get("segmented_sentence")
        except requests.exceptions.RequestException as e:
            return e


DefaultSegmenter = ExternalRenderAPISegmenter
