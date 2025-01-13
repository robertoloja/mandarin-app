import os
from typing import List
from concurrent.futures import ThreadPoolExecutor
import requests
import re

import jieba
from dragonmapper import hanzi
from django.db.models import Q

from mandoBot.settings import BASE_DIR
from sentences.models import CEDictionary, ConstituentHanzi
from sentences.translators import DefaultTranslator
from sentences.functions import is_punctuation
from sentences.dictionaries import WiktionaryScraper


class Segmenter:
    def most_frequent_pronunciation(hanzi5: str) -> CEDictionary:
        """
        When a hanzi has a 5th tone and we have to guess which regular tone
        is most common, this function performs that logic.
        """
        hanzi_regular = CEDictionary.objects.filter(
            Q(traditional=hanzi5) | Q(simplified=hanzi5)
        )

        if hanzi_regular.count() == 0:
            # TODO: Find this hanzi using dictionary classes and return it
            pass
        if hanzi_regular.count() == 1:
            return hanzi_regular
        if hanzi_regular.count() > 1:
            max_count = 0

            for candidate in hanzi_regular:
                count = ConstituentHanzi.objects.filter(hanzi=candidate).count()
                if count > max_count:
                    max_count = count
                    most_common = candidate
        return most_common

    def add_pronunciations(segmented_sentence: List[str]) -> List[dict]:
        pronunciation = [hanzi.to_pinyin(x, accented=False) for x in segmented_sentence]
        response = []

        for i in range(len(segmented_sentence)):
            pinyin = ""

            if hanzi.has_chinese(segmented_sentence[i]) and not is_punctuation(
                segmented_sentence[i]
            ):
                pinyin = re.findall(r"[a-zA-Z]+(?:\d+)?", pronunciation[i])
                zhuyin = [hanzi.pinyin_to_zhuyin(x) for x in pinyin]
            else:
                pinyin = [segmented_sentence[i]]
                zhuyin = [segmented_sentence[i]]

            response += [
                {
                    "word": segmented_sentence[i],
                    "pinyin": pinyin,
                    "zhuyin": zhuyin,
                    "definitions": [],
                }
            ]
        return response

    def add_definitions_and_create_dictionary(
        segmented_sentence: List[dict],
    ) -> dict:
        """
        Modifies 'segmented_sentence' to include word definitions, and returns
        a dictionary with definitions for each hanzi in the sentence.
        """
        dictionary = {}

        for item in segmented_sentence:
            if not hanzi.has_chinese(item["word"]) or is_punctuation(item["word"]):
                continue

            db_result = CEDictionary.objects.filter(
                Q(traditional=item["word"]) | Q(simplified=item["word"]),
                pronunciation__iexact=" ".join(item["pinyin"]),
                word_length=len(item["word"]),
            )

            if not db_result.exists():
                wikitionary = WiktionaryScraper()
                wiki_definitions = wikitionary.get_definitions(item["word"])

                if wiki_definitions and "error" not in wiki_definitions:
                    for key in wiki_definitions:
                        if len(wiki_definitions) == 1:
                            item["pinyin"] = wiki_definitions[key]["pronunciation"]

                        new_cedictionary = CEDictionary.objects.filter(
                            traditional=item["word"],
                            simplified=item["word"],
                            pronunciation=" ".join(
                                wiki_definitions[key]["pronunciation"]
                            ),
                        )

                        if not new_cedictionary.exists():
                            new_cedictionary = CEDictionary.objects.create(
                                traditional=item["word"],
                                simplified=item["word"],
                                pronunciation=" ".join(
                                    wiki_definitions[key]["pronunciation"]
                                ),
                                definitions=[wiki_definitions[key]["definition"]],
                            )
                        elif new_cedictionary.count() > 1:
                            new_cedictionary = new_cedictionary.filter(
                                definitions=" / ".join(
                                    [wiki_definitions[key]["definition"]]
                                )
                            ).first()
                        else:
                            new_cedictionary = new_cedictionary.first()
                        if len(item["word"]) > 1:
                            for i in range(len(item["word"])):
                                wiki_pronunciation = wiki_definitions[key][
                                    "pronunciation"
                                ][i]
                                h = CEDictionary.objects.filter(
                                    pronunciation=wiki_pronunciation,
                                    traditional=item["word"][i],
                                )
                                if h.count() == 0:
                                    h = CEDictionary.objects.filter(
                                        pronunciation__startswith=wiki_pronunciation[
                                            :-1
                                        ]
                                    )

                                if h.count() > 1:
                                    h = Segmenter.most_frequent_pronunciation(
                                        item["word"][i]
                                    )
                                else:
                                    h = h.first()

                                ConstituentHanzi.objects.get_or_create(
                                    word=new_cedictionary, hanzi=h, order=i
                                )

                    db_result = CEDictionary.objects.filter(
                        Q(traditional=item["word"]) | Q(simplified=item["word"]),
                    )
                else:
                    # TODO: Try to segment again before machine translating
                    item["definitions"] = [DefaultTranslator.translate(item["word"])]

                    # TODO: Rewrite this to use CEDictionary.get_hanzi()
                    for index, single_hanzi in enumerate(item["word"]):
                        pinyin = item["pinyin"][index]

                        db_hanzi = CEDictionary.objects.filter(
                            Q(traditional=single_hanzi) | Q(simplified=single_hanzi),
                            pronunciation__iexact=pinyin,
                            word_length=1,
                        )

                        dictionary[single_hanzi] = {
                            "english": [
                                definition
                                for definition in db_hanzi.values_list(
                                    "definitions", flat=True
                                )
                            ],
                            "pinyin": [pinyin],
                            "zhuyin": [
                                hanzi.pinyin_to_zhuyin(zhuyin)
                                for zhuyin in db_hanzi.values_list(
                                    "pronunciation", flat=True
                                )
                            ],
                        }

            results = [result for result in db_result]

            for entry in results:
                item["definitions"] += [entry.definitions]
                constituent_hanzi = entry.get_hanzi()

                if constituent_hanzi:
                    hanzi_list = [h for h in constituent_hanzi]

                    for single_hanzi in hanzi_list:
                        if item["word"] == entry.simplified:
                            if "個" in item["word"]:
                                print(entry)
                            the_hanzi = single_hanzi.simplified
                        else:
                            the_hanzi = single_hanzi.traditional

                        dictionary[the_hanzi] = {
                            "english": [single_hanzi.definitions],
                            "pinyin": [single_hanzi.pronunciation],
                            "zhuyin": [
                                hanzi.pinyin_to_zhuyin(single_hanzi.pronunciation)
                            ],
                        }
                else:
                    if item["word"] == entry.simplified:
                        the_hanzi = entry.simplified
                    else:
                        the_hanzi = entry.traditional

                    dictionary[the_hanzi] = {
                        "english": [entry.definitions],
                        "pinyin": [entry.pronunciation],
                        "zhuyin": [hanzi.pinyin_to_zhuyin(entry.pronunciation)],
                    }

        return dictionary

    @staticmethod
    def segment_and_translate(sentence: str) -> dict:
        sentence = sentence.replace("\u3000", "").strip()

        with ThreadPoolExecutor() as executor:
            future_segmented = executor.submit(DefaultSegmenter.segment, sentence)
            future_translation = executor.submit(DefaultTranslator.translate, sentence)

            segmented = future_segmented.result()
            translated = future_translation.result()

        segmented = Segmenter.add_pronunciations(segmented)
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
            )
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
