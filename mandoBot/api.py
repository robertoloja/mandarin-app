import json
import logging
import time
from typing import cast

from django.core.exceptions import ObjectDoesNotExist
from django.db import Error
from django.conf import settings
from ninja import NinjaAPI
from ninja.throttling import UserRateThrottle
from dragonmapper import hanzi
from accounts.api import router as accounts_router

from sentences.segmenters import Segmenter
from mandoBot.languages import SUPPORTED_LANGUAGES
from sentences.segmenters.types import (
    APISegmentationSuccessResponse,
)
from status.models import ServerStatus
from sentences.models import SentenceHistory
from sentences.models.ReadingRoomChapter import ReadingRoomChapter
from .schemas import (
    ChineseDictionary,
    MandarinWordSchema,
    SegmentationResponse,
    ServerStatusSchema,
    ReadingRoomChapterSchema,
    APIError,
)

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

emptyDictionary = {"word": ChineseDictionary(en=[], de=[], pinyin=[], zhuyin=[])}
emptyWord = MandarinWordSchema(word="", pinyin=[], zhuyin=[], definitions={})
emptyResponse = SegmentationResponse(
    translations={lang: "" for lang in SUPPORTED_LANGUAGES},
    dictionary=emptyDictionary,
    sentence=[emptyWord],
)


@api.post(
    "/segment", response={200: SegmentationResponse}, throttle=[UserRateThrottle("2/s")]
)
def segment(request, data: str) -> APISegmentationSuccessResponse:
    """
    Accepts a string in Mandarin, and returns the same string but segmented into
    individual words, each of which includes pronunciation and definitions. The
    response also includes a dictionary containing every hanzi in the input sentence,
    as well as a machine translation of the entire sentence in all supported languages.
    """
    timer = Timer()
    timer.start()

    auth = False
    MAX_CHARS_FREE = 200 if not settings.DEBUG else 10000
    MAX_CHARS_PAID = 1000

    if request.user.is_authenticated:
        text_to_segment = data[:MAX_CHARS_PAID]
        if not request.user.is_staff:
            auth = True
    else:
        text_to_segment = data[:MAX_CHARS_FREE]

    if not data:
        return 200, cast(SegmentationResponse, emptyResponse)

    if not hanzi.has_chinese(data):
        return 200, handle_non_chinese(data)

    segmented_data = Segmenter.segment_and_translate(text_to_segment, auth)
    timer.stop()
    return 200, segmented_data


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


def handle_non_chinese(data: str) -> SegmentationResponse:
    """
    When the "word" and the only item in "sentence" are equal,
    the frontend recognizes that this is punctuation.
    """
    word = MandarinWordSchema(word=data, pinyin=[data], zhuyin=[data], definitions={})
    chinese_dictionary = ChineseDictionary(en=[], de=[], pinyin=[], zhuyin=[])
    dictionary: dict[str, ChineseDictionary] = {"word": chinese_dictionary}

    foo = SegmentationResponse(
        translations={lang: data for lang in SUPPORTED_LANGUAGES},
        sentence=[word],
        dictionary=dictionary,
    )
    return foo


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
    return _migrate_shared_json(json.loads(db_entry.json_data))
    """Migrate old single-language share JSON to the current multi-language format."""
    for word in data.get("sentence", []):
        if isinstance(word.get("definitions"), list):
            word["definitions"] = {"en": word["definitions"], "de": word["definitions"]}
    for hanzi_entry in data.get("dictionary", {}).values():
        if "english" in hanzi_entry:
            hanzi_entry["en"] = hanzi_entry.pop("english")
        if "de" not in hanzi_entry:
            hanzi_entry["de"] = hanzi_entry.get("en", [])
    return data


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


@api.get(
    "/reading-room/{book_slug}/{chapter_order}/",
    response={200: ReadingRoomChapterSchema, 404: APIError},
)
def get_reading_room_chapter(request, book_slug: str, chapter_order: int):
    try:
        chapter = ReadingRoomChapter.objects.get(
            book_slug=book_slug, chapter_order=chapter_order
        )
    except ReadingRoomChapter.DoesNotExist:
        return 404, {"error": "Chapter not found"}
    return 200, chapter.data
