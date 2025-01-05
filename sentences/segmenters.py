import os
from typing import List
from concurrent.futures import ThreadPoolExecutor
import requests

import jieba
from dragonmapper import hanzi, transcriptions
from django.db.models import Q

from mandoBot.settings import BASE_DIR
from sentences.models import CEDictionary
from sentences.translators import DefaultTranslator
from sentences.functions import is_punctuation


class Segmenter:
    def add_pinyin(segmented_sentence: List[str]) -> List[dict]:
        # In zhuyin, the individual hanzi are space delimited already,
        # while in pinyin the whole word is together, so we start with zhuyin.
        pronunciation = list(map(lambda x: hanzi.to_zhuyin(x), segmented_sentence))
        response = []

        for i in range(len(segmented_sentence)):
            pinyin = ""

            if hanzi.has_chinese(segmented_sentence[i]) and not is_punctuation(
                segmented_sentence[i]
            ):  # not punctuation/numbers/alphabet
                pinyin = [
                    # the next line messes up 而 (r2 instead of re2)
                    transcriptions.zhuyin_to_pinyin(x)
                    for x in pronunciation[i].split(" ")
                ]
            else:
                pinyin = [segmented_sentence[i]]  # this is punctuation, digits, etc.

            response += [
                {
                    "word": segmented_sentence[i],
                    "pinyin": pinyin,
                    "definitions": [],
                }
            ]
        return response

    def add_definitions_and_create_dictionary(segmented_sentence: List[dict]) -> dict:
        """
        Modifies 'segmented_sentence' to include word definitions, and returns
        a dictionary with definitions for each hanzi in the sentence.
        """
        dictionary = {}

        for item in segmented_sentence:
            if not hanzi.has_chinese(item["word"]) or is_punctuation(item["word"]):
                continue

            pinyin = " ".join(
                map(
                    lambda x: transcriptions.accented_syllable_to_numbered(x),
                    item["pinyin"],
                )
            )
            db_result = CEDictionary.objects.filter(
                Q(traditional=item["word"]) | Q(simplified=item["word"]),
                pronunciation__iexact=pinyin,  # "Bei jing" and "bei jing"
                word_length=len(item["word"]),
            )

            if not db_result.exists():
                # TODO: Include a way to figure out if this is traditional or simplified
                item["definitions"] = [DefaultTranslator.translate(item["word"])]

                for index, single_hanzi in enumerate(item["word"]):
                    pinyin = hanzi.accented_to_numbered(item["pinyin"][index])

                    db_hanzi = CEDictionary.objects.filter(
                        Q(traditional=single_hanzi) | Q(simplified=single_hanzi),
                        pronunciation__iexact=pinyin,
                        word_length=1,
                    )

                    dictionary[single_hanzi] = {
                        "english": list(db_hanzi.values_list("definitions", flat=True)),
                        "pinyin": list(
                            db_hanzi.values_list("pronunciation", flat=True)
                        ),
                    }
            else:
                for entry in db_result:

                    item["definitions"] += [entry.definitions]
                    constituent_hanzi = entry.constituent_hanzi.all()

                    if constituent_hanzi.exists():
                        for single_hanzi in constituent_hanzi:
                            if item["word"] == entry.simplified:
                                the_hanzi = single_hanzi.simplified
                            else:
                                the_hanzi = single_hanzi.traditional

                            dictionary[the_hanzi] = {
                                "english": [single_hanzi.definitions],
                                "pinyin": [single_hanzi.pronunciation],
                            }
                    else:
                        if item["word"] == entry.simplified:
                            the_hanzi = entry.simplified
                        else:
                            the_hanzi = entry.traditional
                        dictionary[the_hanzi] = {
                            "english": [entry.definitions],
                            "pinyin": [entry.pronunciation],
                        }

        return dictionary

    @staticmethod
    def segment_and_translate(sentence: str) -> dict:
        with ThreadPoolExecutor() as executor:
            future_segmented = executor.submit(DefaultSegmenter.segment, sentence)
            future_translation = executor.submit(DefaultTranslator.translate, sentence)

            segmented = future_segmented.result()
            translated = future_translation.result()

        segmented = Segmenter.add_pinyin(segmented)
        dictionary = Segmenter.add_definitions_and_create_dictionary(segmented)

        return {
            "translation": translated,
            "sentence": segmented,
            "dictionary": dictionary,
        }


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


DefaultSegmenter = JiebaSegmenter
