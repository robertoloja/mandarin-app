import os
from typing import List
from concurrent.futures import ThreadPoolExecutor
import requests

import jieba
from dragonmapper import hanzi, transcriptions
from django.db.models import Q

from mandoBot.settings import BASE_DIR
from sentences.models import CEDictionary, ConstituentHanzi
from sentences.translators import DefaultTranslator
from sentences.functions import is_punctuation
from sentences.dictionaries import WiktionaryScraper


class Segmenter:
    def add_pronunciations(segmented_sentence: List[str]) -> List[dict]:
        # In zhuyin, the individual hanzi are space delimited already,
        # while in pinyin the whole word is together, so we start with zhuyin.
        pronunciation = list(map(lambda x: hanzi.to_zhuyin(x), segmented_sentence))
        response = []

        for i in range(len(segmented_sentence)):
            pinyin = ""

            if hanzi.has_chinese(segmented_sentence[i]) and not is_punctuation(
                segmented_sentence[i]
            ):
                pinyin = [
                    # TODO: the next line messes up 而 (r2 instead of er2). See SCRUM-75
                    transcriptions.zhuyin_to_pinyin(x)
                    for x in pronunciation[i].split(" ")
                ]
                zhuyin = [x for x in pronunciation[i].split(" ")]
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

    async def add_definitions_and_create_dictionary(
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

            # In the db, pinyin is stored as numbered syllables, so convert before queries
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

            if not await db_result.aexists():
                wikitionary = WiktionaryScraper()
                wiki_definitions = wikitionary.get_definitions(item["word"])

                if "error" not in wiki_definitions:
                    for key in wiki_definitions:
                        new_cedictionary = CEDictionary.objects.create(
                            traditional=item["word"],
                            simplified=item["word"],
                            pronunciation=wiki_definitions[key]["pronunciation"],
                            definitions=wiki_definitions[key]["definition"],
                        )
                        if len(item["word"]) > 1:
                            split_pronunciation = wiki_definitions[key][
                                "pronunciation"
                            ].split(" ")
                            for i in range(len(item["word"])):
                                h = CEDictionary.objects.filter(
                                    traditional=item["word"][i],
                                    pronunciation=split_pronunciation[i],
                                )
                                if not h.exists():
                                    continue

                                ConstituentHanzi.objects.create(
                                    word=new_cedictionary, hanzi=h, order=i
                                )
                        else:
                            CEDictionary.objects.create(
                                traditional=item["word"],
                                simplified=item["word"],
                                pronunciation=wiki_definitions[key]["pronunciation"],
                                definitions=wiki_definitions[key]["definition"],
                            )
                else:
                    pass  # TODO: Try to segment again before machine translating

                item["definitions"] = [DefaultTranslator.translate(item["word"])]

                # TODO: Rewrite this to use CEDictionary.get_hanzi()
                for index, single_hanzi in enumerate(item["word"]):
                    pinyin = hanzi.accented_to_numbered(item["pinyin"][index])

                    db_hanzi = CEDictionary.objects.filter(
                        Q(traditional=single_hanzi) | Q(simplified=single_hanzi),
                        pronunciation__iexact=pinyin,
                        word_length=1,
                    )

                    dictionary[single_hanzi] = {
                        "english": [
                            definition
                            async for definition in db_hanzi.values_list(
                                "definitions", flat=True
                            )
                        ],
                        "pinyin": [
                            pinyin
                            async for pinyin in db_hanzi.values_list(
                                "pronunciation", flat=True
                            )
                        ],
                        "zhuyin": [
                            hanzi.pinyin_to_zhuyin(zhuyin)
                            async for zhuyin in db_hanzi.values_list(
                                "pronunciation", flat=True
                            )
                        ],
                    }
            else:
                results = [result async for result in db_result]

                for entry in results:
                    item["definitions"] += [entry.definitions]
                    constituent_hanzi = await entry.get_hanzi()

                    if constituent_hanzi:
                        hanzi_list = [h for h in constituent_hanzi]

                        for single_hanzi in hanzi_list:
                            if item["word"] == entry.simplified:
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
    async def segment_and_translate(sentence: str) -> dict:
        sentence = sentence.replace("\u3000", "").strip()

        with ThreadPoolExecutor() as executor:
            future_segmented = executor.submit(DefaultSegmenter.segment, sentence)
            future_translation = executor.submit(DefaultTranslator.translate, sentence)

            segmented = future_segmented.result()
            translated = future_translation.result()

        segmented = Segmenter.add_pronunciations(segmented)
        dictionary = await Segmenter.add_definitions_and_create_dictionary(segmented)

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
