import secrets
from django.http import HttpRequest

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


@api.get("/shared", response=str)
def retrieve_shared(request, share_id):
    # TODO: Get the database table with the share_id as index, and return the json value
    return ""


@api.post("/share", response=str)
def share(request, data: SegmentationResponse) -> str:
    # TODO: Create database row with the url_token as the key and the data as the value
    # TODO: Check if the sentence has already been stored in SentenceHistory and, if so,
    # return the existing token.
    url_token = secrets.token_urlsafe(10)
    url = f"{request.scheme}//{request.get_host()}/shared?link={url_token}"
    return url


@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str) -> SegmentationResponse:
    if not data:
        return emptyResponse

    if not hanzi.has_chinese(data):
        return handle_non_chinese(data)

    segmented_data = DefaultSegmenter.segment_and_translate(data)
    return segmented_data


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
