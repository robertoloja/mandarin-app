import json
import logging
import time

from django.core.exceptions import ObjectDoesNotExist
from django.db import Error
from django.conf import settings
from ninja import NinjaAPI
from dragonmapper import hanzi
from accounts.api import router as accounts_router

from sentences.segmenters import Segmenter
from status.models import ServerStatus
from .schemas import (
    SegmentationResponse,
    ServerStatusSchema,
)
from sentences.models import SentenceHistory

logger = logging.getLogger(__name__)
api = NinjaAPI(
    title="MandoBotAPI",
    description="""Handles sentence segmentation, translation,
    and sharing of mandarin sentences.""",
    version="0.9.0",
    servers=[
        {
            "url": "https://localhost:8000",
            "description": "Default server address for local development.",
        },
        {
            "url": "https://mandobot.pythonanywhere.com",
            "description": "Free host, first host of the mandoBot API.",
        },
    ],
)
api.add_router("/accounts/", accounts_router)

emptyResponse = {
    "translation": "",
    "dictionary": {"word": {"english": [], "pinyin": [], "zhuyin": []}},
    "sentence": [{"word": "", "pinyin": [], "zhuyin": [], "definitions": []}],
}


# TODO: Respond with HTTP status codes
@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str) -> SegmentationResponse:
    """
    Accepts a string in Mandarin, and returns the same string but segmented into
    individual words, each of which includes pronunciation and definitions. The
    response also includes a dictionary containing every hanzi in the input sentence,
    as well as a machine translation of the entire sentence.
    """
    timer = Timer()
    timer.start()

    MAX_CHARS_FREE = 200 if not settings.DEBUG else 1000
    if request.user.is_authenticated:
        text_to_segment = data[:1000]
    else:
        text_to_segment = data[:MAX_CHARS_FREE]

    if not data:
        return emptyResponse

    if not hanzi.has_chinese(data):
        return handle_non_chinese(data)

    segmented_data = Segmenter.segment_and_translate(text_to_segment)
    timer.stop()
    return segmented_data


class Timer:
    start_time = 0

    def start(self):
        self.start_time = time.perf_counter()

    def stop(self):
        end_time = time.perf_counter()

        server_status = ServerStatus.objects.last()
        server_status.mandobot_response_time = (
            (server_status.mandobot_response_time or 4) + (end_time - self.start_time)
        ) / 2
        server_status.save()


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


@api.get("/status", response=ServerStatusSchema)
def server_status(request):
    status = ServerStatus.objects.last()
    print(status)
    return status


@api.get("/shared", response=SegmentationResponse)
async def retrieve_shared(request, share_id: str) -> SegmentationResponse:
    """
    Receives a sentence_id, retrieves the stored JSON of a segmented sentence,
    and returns it so it can immediately populate the client.
    """
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
async def create_share_link(request, data: SegmentationResponse) -> str:
    """
    Receives a full JSON of a segmentation, retrieves or creates it, then returns
    the corresponding sentence_id to be used by the /shared endpoint.
    """
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
