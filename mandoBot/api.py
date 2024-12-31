import string
from ninja import NinjaAPI, Router
from django.db.models import Q
from dragonmapper import hanzi, transcriptions

from sentences.segmenters import DefaultSegmenter
from sentences.translators import DefaultTranslator
from sentences.models import CEDictionary
from .schemas import SegmentationResponse

api = NinjaAPI()
router = Router()
api.add_router("", router)


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
    punctuation = "、。？，：；《》【】（）［］！＠＃＄％＾＆＊－／＋＝－～'\""
    dictionary = {
        single_hanzi: get_hanzi_dictionary(single_hanzi)
        for single_hanzi in data
        if single_hanzi not in punctuation
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
        Q(traditional=word) | Q(simplified=word)
    ).values_list("definitions", flat=True)

    if not defs:
        translated_word = DefaultTranslator.translate(word)
        return [
            translated_word.lower().translate(str.maketrans("", "", string.punctuation))
        ]
    return defs


def get_hanzi_dictionary(single_hanzi: str) -> dict:
    hanzi_defs = CEDictionary.objects.filter(
        Q(traditional=single_hanzi) | Q(simplified=single_hanzi)
    ).values_list("definitions", "pronunciation")

    dictionary = {
        "english": [x[0] for x in hanzi_defs],
        "pinyin": [
            transcriptions.numbered_syllable_to_accented(x[1]) for x in hanzi_defs
        ],
    }
    return dictionary
