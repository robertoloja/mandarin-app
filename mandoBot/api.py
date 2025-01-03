import string
from ninja import NinjaAPI
from django.db.models import Q
from dragonmapper import hanzi, transcriptions

from sentences.segmenters import DefaultSegmenter
from sentences.translators import DefaultTranslator
from sentences.models import CEDictionary
from .schemas import SegmentationResponse

api = NinjaAPI()


@api.post("/share", response=str)
def share(request, data: str) -> str:
    return ""


@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str) -> dict:
    if not hanzi.has_chinese(data):
        return handle_non_chinese(data)

    segmented_data = segment_and_translate(data)
    return segmented_data


# Utility functions
def handle_non_chinese(data: str) -> dict:
    """
    When the "word" and the only item in "sentence" are equal,
    the frontend recognizes that this is punctuation.
    """
    word = {
        "word": data,
        "pinyin": [data],
        "definitions": [],
    }

    return {"translation": data, "sentence": [word], "dictionary": {}}


def segment_and_translate(data: str) -> dict:
    # punctuation = "、。？，：；《》【】（）［］！＠＃＄％＾＆＊－／＋＝－～'\""
    dictionary = {
        single_hanzi: get_hanzi_dictionary(single_hanzi)
        for single_hanzi in data
        if hanzi.has_chinese(single_hanzi)
    }
    segmented = DefaultSegmenter.segment_and_translate(data)
    segmented["dictionary"] = dictionary
    return add_definitions(segmented)


def add_definitions(segmented: dict) -> dict:
    for i, segment in enumerate(segmented["sentence"]):
        word = segment["word"]
        if hanzi.has_chinese(word):
            defs = get_definitions(word)
            segmented["sentence"][i]["definitions"] = defs
    return segmented


def get_definitions(word: str) -> list:
    defs = CEDictionary.objects.filter(
        Q(traditional=word) | Q(simplified=word), word_length=len(word)
    ).only("definitions")

    if not defs.exists():
        translated_word = DefaultTranslator.translate(word)
        return [
            translated_word.lower().translate(str.maketrans("", "", string.punctuation))
        ]
    return [x.definitions for x in defs]


def get_hanzi_dictionary(single_hanzi: str) -> dict:
    hanzi_defs = (
        CEDictionary.objects.filter(
            Q(traditional=single_hanzi) | Q(simplified=single_hanzi), word_length=1
        )
        .only("definitions", "pronunciation")
        .values()
    )

    dictionary = {}

    for word in hanzi_defs.iterator():
        if single_hanzi in dictionary:
            dictionary["english"] += word["definitions"]
            dictionary["pinyin"] += word["pronunciation"]
        else:
            dictionary = {
                "english": [word["definitions"]],
                "pinyin": [
                    transcriptions.numbered_syllable_to_accented(word["pronunciation"])
                ],
            }
    return dictionary
