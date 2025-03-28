import re
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Tuple
from django.db.models import Q
from dragonmapper import hanzi as hanzi_utils

from mandoBot.schemas import ChineseDictionary, MandarinWordSchema, SegmentationResponse
from sentences.dictionaries import WiktionaryScraper
from sentences.models.CEDictionary import CEDictionary
from sentences.models.ConstituentHanzi import ConstituentHanzi
from sentences.functions import is_punctuation
from sentences.translators import DeepLTranslate
from ..translators import Translator
from ..segmenters import JiebaSegmenter


class Segmenter:
    @staticmethod
    def segment_and_translate(
        sentence: str, auth: bool = False
    ) -> SegmentationResponse:
        sentence = sentence.replace("\u3000", "").strip()

        with ThreadPoolExecutor() as executor:
            future_segmented = executor.submit(JiebaSegmenter.segment, sentence)
            if auth:
                future_translation = executor.submit(DeepLTranslate.translate, sentence)
            else:
                future_translation = executor.submit(Translator.translate, sentence)

            segmented = future_segmented.result()
            translated = future_translation.result()

        segmented_list: List[MandarinWordSchema] = Segmenter.add_pronunciations(
            segmented
        )
        segmented_sentence, dictionary = (
            Segmenter.add_definitions_and_create_dictionary(segmented_list)
        )
        mandarin_sentence: List[MandarinWordSchema] = segmented_sentence

        result = SegmentationResponse(
            translation=translated, sentence=mandarin_sentence, dictionary=dictionary
        )

        return result

    @staticmethod
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
            hanzi = hanzi_regular.first()
            if hanzi is not None:
                return hanzi
        if hanzi_regular.count() > 1:
            max_count = 0

            for candidate in hanzi_regular:
                count = ConstituentHanzi.objects.filter(hanzi=candidate).count()
                if count > max_count:
                    max_count = count
                    most_common = candidate
        return most_common

    @staticmethod
    def add_pronunciations(segmented_sentence: List[str]) -> List[MandarinWordSchema]:
        pronunciation = [
            hanzi_utils.to_pinyin(x, accented=False) for x in segmented_sentence
        ]
        response: List[MandarinWordSchema] = []

        for i in range(len(segmented_sentence)):
            pinyin = ""

            if hanzi_utils.has_chinese(segmented_sentence[i]) and not is_punctuation(
                segmented_sentence[i]
            ):
                pinyin = re.findall(r"[a-zA-Zü]+(?:\d+)?", pronunciation[i])
                zhuyin = [Segmenter.pinyin_to_zhuyin(x) for x in pinyin]
            else:
                pinyin = [segmented_sentence[i]]
                zhuyin = [segmented_sentence[i]]

            new_word = MandarinWordSchema(
                word=segmented_sentence[i], pinyin=pinyin, zhuyin=zhuyin, definitions=[]
            )
            response += [new_word]
        return response

    @staticmethod
    def try_to_concat(
        segmented_sentence: List[MandarinWordSchema], index: int
    ) -> List[MandarinWordSchema] | None:
        """
        Try to concatenate the current word with the next, including if there is a
        comma between them. This is specifically meant to catch 成語, which are
        stored in the database with a comma between their two parts.
        """
        if (
            len(segmented_sentence[index:]) < 3
            or "，" in segmented_sentence[index].word
            or "," in segmented_sentence[index].word
            or len(segmented_sentence[index].word) > 8
        ):
            # Prevent looping
            return

        if segmented_sentence[index + 1].word in [",", "，"]:
            compounded_word = "".join(
                segmented_sentence[index].word + segmented_sentence[index + 2].word
            )

            db_word = CEDictionary.objects.filter(
                Q(traditional=compounded_word) | Q(simplified=compounded_word)
            )

            if db_word.exists() and db_word.count() == 1:
                pinyin: List[str] = (
                    segmented_sentence[index].pinyin
                    + [","]
                    + segmented_sentence[index + 2].pinyin
                )

                zhuyin: List[str] = (
                    segmented_sentence[index].zhuyin
                    + [","]
                    + segmented_sentence[index + 2].zhuyin
                )

                new_sentence_slice = MandarinWordSchema(
                    word=compounded_word, pinyin=pinyin, zhuyin=zhuyin, definitions=[]
                )

                new_sentence = (
                    segmented_sentence[:index]
                    + [new_sentence_slice]
                    + segmented_sentence[index + 3 :]
                )
                return new_sentence
        return

    @staticmethod
    def add_definitions_and_create_dictionary(
        segmented_sentence: List[MandarinWordSchema],
        dictionary: Dict[str, ChineseDictionary] = {},
    ) -> tuple[List[MandarinWordSchema], dict[str, ChineseDictionary]]:
        """
        Modifies 'segmented_sentence' and returns a tuple containing
        the sentence and a dictionary with definitions for each hanzi
        in the sentence.

        :param segmented_sentence: The list of MandarinWordSchema objects being worked on.
        :return: A tuple containing the sentence, and the mandarin dictionary.
        """
        for index, item in enumerate(segmented_sentence):
            if is_punctuation(item.word) or not hanzi_utils.has_chinese(item.word):
                continue

            if item.definitions != []:
                continue

            if "ü" in " ".join(item.pinyin):
                pinyin_to_search = " ".join(item.pinyin).replace("ü", "u:")
            else:
                pinyin_to_search = " ".join(item.pinyin)

            db_result = CEDictionary.objects.filter(
                Q(traditional=item.word) | Q(simplified=item.word),
                pronunciation__iexact=pinyin_to_search,
                word_length=len(item.word),
            )

            if not db_result.exists():
                concat_attempt = Segmenter.try_to_concat(segmented_sentence, index)
                if concat_attempt:
                    return Segmenter.add_definitions_and_create_dictionary(
                        concat_attempt, dictionary
                    )

                wikitionary = WiktionaryScraper()
                wiki_definitions = wikitionary.get_definitions(item.word)

                if wiki_definitions and "error" not in wiki_definitions:
                    for key in wiki_definitions:
                        new_cedictionary = CEDictionary.objects.filter(
                            traditional=item.word,
                            simplified=item.word,
                            pronunciation=" ".join(
                                wiki_definitions[key]["pronunciation"]
                            ),
                        )

                        if not new_cedictionary.exists():
                            new_cedictionary = CEDictionary.objects.create(
                                traditional=item.word,
                                simplified=item.word,
                                pronunciation=" ".join(
                                    wiki_definitions[key]["pronunciation"]
                                ),
                                definitions=wiki_definitions[key]["definition"],
                            )

                        elif new_cedictionary.count() > 1:
                            new_cedictionary = new_cedictionary.filter(
                                definitions=" / ".join(
                                    [wiki_definitions[key]["definition"]]
                                )
                            ).first()

                        else:
                            new_cedictionary = new_cedictionary.first()

                        if len(item.word) > 1:
                            for i in range(len(item.word)):
                                wiki_pronunciation = wiki_definitions[key][
                                    "pronunciation"
                                ][i]
                                h = CEDictionary.objects.filter(
                                    pronunciation=wiki_pronunciation,
                                    traditional=item.word[i],
                                )
                                if h.count() == 0:
                                    h = CEDictionary.objects.filter(
                                        pronunciation__startswith=wiki_pronunciation[
                                            :-1
                                        ]
                                    ).first()

                                elif h.count() > 1:
                                    h = Segmenter.most_frequent_pronunciation(
                                        item.word[i]
                                    )
                                else:
                                    h = h.first()

                                ConstituentHanzi.objects.get_or_create(
                                    word=new_cedictionary, hanzi=h, order=i
                                )

                    db_result = CEDictionary.objects.filter(
                        Q(traditional=item.word) | Q(simplified=item.word),
                    )
                else:
                    # TODO: Try to segment again before machine translating
                    item.definitions = [Translator.translate(item.word)]

                    for index, single_hanzi in enumerate(item.word):
                        pinyin = item.pinyin[index]

                        db_hanzi = CEDictionary.objects.filter(
                            Q(traditional=single_hanzi) | Q(simplified=single_hanzi),
                            pronunciation__iexact=pinyin,
                            word_length=1,
                        )

                        if not db_hanzi.exists():
                            db_hanzi = CEDictionary.objects.filter(
                                Q(traditional=single_hanzi)
                                | Q(simplified=single_hanzi),
                                pronunciation__startswith=pinyin[:-1],
                                word_length=1,
                            )

                        dictionary[single_hanzi] = ChineseDictionary(
                            english=[
                                definition
                                for definition in db_hanzi.values_list(
                                    "definitions", flat=True
                                )
                            ],
                            pinyin=[pinyin.replace("u:", "ü")],
                            zhuyin=[
                                Segmenter.pinyin_to_zhuyin(zhuyin)
                                for zhuyin in db_hanzi.values_list(
                                    "pronunciation", flat=True
                                )
                            ],
                        )

            for entry in db_result:
                item.definitions += [entry.definitions]
                constituent_hanzi = entry.get_hanzi()

                if constituent_hanzi:
                    for single_hanzi in constituent_hanzi:
                        if item.word == entry.traditional:
                            the_hanzi = single_hanzi.traditional
                        else:
                            the_hanzi = single_hanzi.simplified

                        dictionary[the_hanzi] = ChineseDictionary(
                            english=[single_hanzi.definitions],
                            pinyin=[single_hanzi.pronunciation.replace("u:", "ü")],
                            zhuyin=[
                                Segmenter.pinyin_to_zhuyin(single_hanzi.pronunciation)
                            ],
                        )
                else:
                    for index, hanzi in enumerate(item.word):
                        the_hanzi, db_hanzi = Segmenter.attempt_to_get_hanzi(
                            hanzi, item, index, entry
                        )
                        dictionary[the_hanzi] = ChineseDictionary(
                            english=[db_hanzi.definitions],
                            pinyin=[db_hanzi.pronunciation.replace("u:", "ü")],
                            zhuyin=[Segmenter.pinyin_to_zhuyin(db_hanzi.pronunciation)],
                        )
        return (segmented_sentence, dictionary)

    @staticmethod
    def attempt_to_get_hanzi(
        hanzi: str, item: MandarinWordSchema, index: int, entry: CEDictionary
    ) -> Tuple[str, CEDictionary]:
        if "ü" in item.pinyin[index]:
            pinyin_to_search = item.pinyin[index].replace("ü", "u:")
        else:
            pinyin_to_search = item.pinyin[index]

        if item.word == entry.traditional:
            db_hanzi = CEDictionary.objects.filter(
                traditional=hanzi, pronunciation=pinyin_to_search
            )
        else:
            db_hanzi = CEDictionary.objects.filter(
                simplified=hanzi, pronunciation=pinyin_to_search
            )
        if not db_hanzi.exists():
            if item.word == entry.traditional:
                db_hanzi = CEDictionary.objects.filter(
                    traditional=hanzi, pronunciation__iexact=pinyin_to_search
                )
            else:
                db_hanzi = CEDictionary.objects.filter(
                    simplified=hanzi, pronunciation__iexact=pinyin_to_search
                )
        if not db_hanzi.exists():
            if item.word == entry.traditional:
                db_hanzi = CEDictionary.objects.filter(
                    traditional=hanzi,
                    pronunciation=pinyin_to_search[:-1],
                )
            else:
                db_hanzi = CEDictionary.objects.filter(
                    simplified=hanzi,
                    pronunciation=pinyin_to_search[:-1],
                )
        if not db_hanzi.exists():
            if item.word == entry.traditional:
                db_hanzi = CEDictionary.objects.filter(traditional=hanzi)
            else:
                db_hanzi = CEDictionary.objects.filter(simplified=hanzi)

        if item.word == entry.traditional:
            the_hanzi = db_hanzi.first().traditional
            # likely a bug? should check for multiple results
        else:
            the_hanzi = (
                db_hanzi.first().simplified
            )  # likely a bug? should check for multiple results
        return the_hanzi, db_hanzi.first()

    @staticmethod
    def pinyin_to_zhuyin(pinyin: str) -> str:
        """Only works for single hanzi"""
        if ":" not in pinyin:
            return hanzi_utils.pinyin_to_zhuyin(pinyin)

        umlaut = "ü"
        number = pinyin[-1]
        result = hanzi_utils.pinyin_to_zhuyin(pinyin[:-3] + umlaut + number)
        return result
