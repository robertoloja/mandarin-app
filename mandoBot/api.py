from ninja import NinjaAPI
from dragonmapper import hanzi

from sentences.segmenters import DefaultSegmenter
from .schemas import SegmentationResponse

api = NinjaAPI()

emptyResponse = {
    "translation": "",
    "dictionary": {"word": {"english": [], "pinyin": []}},
    "sentence": [{"word": "", "pinyin": [], "definitions": []}],
}


@api.post("/share", response=str)
def share(request, data: str) -> str:
    # TODO: Create a UUID, store the JSON, return the UUID
    return ""


# TODO: Rewrite this to use the new database features
@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str) -> SegmentationResponse:
    if not data:
        return emptyResponse

    if not hanzi.has_chinese(data):
        return handle_non_chinese(data)

    segmented_data = DefaultSegmenter.segment_and_translate(data)
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

    return {
        "translation": data,
        "sentence": [word],
        "dictionary": {"word": {"english": [], "pinyin": []}},
    }
