import json
import logging

from django.db import Error
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login, logout
from ninja import NinjaAPI
from dragonmapper import hanzi

from sentences.segmenters import DefaultSegmenter
from .schemas import SegmentationResponse, UserSchema
from sentences.models import SentenceHistory

logger = logging.getLogger(__name__)
api = NinjaAPI()

emptyResponse = {
    "translation": "",
    "dictionary": {"word": {"english": [], "pinyin": [], "zhuyin": []}},
    "sentence": [{"word": "", "pinyin": [], "zhuyin": [], "definitions": []}],
}

# TODO: Respond with HTTP status codes


@api.post("/login")
def login_endpoint(request, payload: UserSchema) -> str:
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        login(request, user)
        return "success"
    else:
        print("It failed on the server")
        return "failed"


@api.post("/logout")
def logout_view(request) -> str:
    logout(request)
    return "success"


@api.get("/shared", response=SegmentationResponse)
async def retrieve_shared(request, share_id: str) -> SegmentationResponse:
    try:
        db_entry = await SentenceHistory.objects.aget(sentence_id=share_id)
    except ObjectDoesNotExist:
        logger.error(f"No SentenceHistory object with sentence_id: {share_id}")
        return emptyResponse
    except Error:
        logger.error(
            f"Database error while getting SentenceHistory.sentence_id: {share_id}"
        )
        return emptyResponse
    return json.loads(db_entry.json_data)


@api.post("/share", response=str)
async def share(request, data: SegmentationResponse) -> str:
    try:
        db_entry, _ = await SentenceHistory.objects.aget_or_create(
            json_data=data.dict()
        )
    except Error:
        logger.error(
            f"""Database error while getting/creating
            SentenceHistory entry for {''.join([word for word in data.sentence])}"""
        )
    return db_entry.sentence_id


@api.post("/segment", response=SegmentationResponse)
async def segment(request, data: str) -> SegmentationResponse:
    if not data:
        return emptyResponse

    if not hanzi.has_chinese(data):
        return handle_non_chinese(data)

    segmented_data = await DefaultSegmenter.segment_and_translate(data)
    return segmented_data


def handle_non_chinese(data: str) -> dict:
    """
    When the "word" and the only item in "sentence" are equal,
    the frontend recognizes that this is punctuation.
    """
    word = {
        "word": data,
        "pinyin": [data],
        "zhuyin": [data],
        "definitions": [],
    }

    return {
        "translation": data,
        "sentence": [word],
        "dictionary": {"word": {"english": [], "pinyin": [], "zhuyin": []}},
    }
