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
from sentences.segmenters.types import (
    APISegmentationSuccessResponse,
)
from status.models import ServerStatus
from sentences.models import SentenceHistory, ReadingRoomText, CEDictionary, CEDefinition
from sentences.models.ReadingRoomChapter import ReadingRoomChapter
from .schemas import (
    ChineseDictionary,
    MandarinWordSchema,
    SegmentationResponse,
    ServerStatusSchema,
    ReadingRoomResponseSchema,
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

emptyDictionary = {"word": ChineseDictionary(english=[], pinyin=[], zhuyin=[])}
emptyWord = MandarinWordSchema(word="", pinyin=[], zhuyin=[], definitions=[])
emptyResponse = SegmentationResponse(
    translation="", dictionary=emptyDictionary, sentence=[emptyWord]
)


@api.post(
    "/segment", response={200: SegmentationResponse}, throttle=[UserRateThrottle("2/s")]
)
def segment(request, data: str, language: str = None) -> APISegmentationSuccessResponse:
    """
    Accepts a string in Mandarin, and returns the same string but segmented into
    individual words, each of which includes pronunciation and definitions. The
    response also includes a dictionary containing every hanzi in the input sentence,
    as well as a machine translation of the entire sentence.
    
    Args:
        data: Chinese text to segment
        language: Optional target language ('en' or 'de'). If provided, overrides user preference.
                 Useful for anonymous users to specify their language preference.
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

    # Get target language from (in priority order):
    # 1. Query parameter (allows anonymous users to specify preference)
    # 2. Authenticated user's stored preference
    # 3. Default to English
    target_language = 'en'
    
    if language:
        # Query parameter provided - use it (from frontend localStorage)
        target_language = language
    elif request.user.is_authenticated:
        # Authenticated user - use stored preference
        if hasattr(request.user, 'user_language') and request.user.user_language:
            target_language = request.user.user_language

    if not data:
        return 200, cast(SegmentationResponse, emptyResponse)

    if not hanzi.has_chinese(data):
        return 200, handle_non_chinese(data)

    segmented_data = Segmenter.segment_and_translate(
        text_to_segment, auth, target_language=target_language
    )
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
    word = MandarinWordSchema(word=data, pinyin=[data], zhuyin=[data], definitions=[])
    chinese_dictionary = ChineseDictionary(english=[], pinyin=[], zhuyin=[])
    dictionary: dict[str, ChineseDictionary] = {"word": chinese_dictionary}

    foo = SegmentationResponse(
        translation=data,
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
    return json.loads(db_entry.json_data)


@api.get("/reading-room/{reading_id}/")
def get_reading_room_text(request, reading_id: int, language: str = 'en'):
    """
    Retrieves a reading room text with language-aware definitions.
    Public endpoint - no authentication required.
    
    Fetches the reading room text by ID, retrieves segmentation, and looks up
    definitions in the target language (with fallback to English).
    
    Args:
        reading_id: ID of the ReadingRoomText to retrieve
        language: Target language for definitions ('en' or 'de'). Defaults to 'en'.
    
    Returns:
        JSON with id, book, title, and words array with localized definitions
    """
    try:
        reading_text = ReadingRoomText.objects.get(id=reading_id)
    except ReadingRoomText.DoesNotExist:
        from django.http import JsonResponse
        return JsonResponse({'error': 'Reading room text not found'}, status=404)
    
    # Validate language parameter
    if language not in ['en', 'de']:
        language = 'en'
    
    # Compose response with localized definitions
    words = []
    
    for segment in reading_text.segmentation:
        # Start with all original segmentation fields
        word_data = segment.copy() if isinstance(segment, dict) else dict(segment)
        
        # Look up definition for this word
        try:
            # Get CEDictionary entry by pronunciation (pinyin)
            cedict = CEDictionary.objects.get(
                pronunciation__iexact=word_data.get('pinyin', ''),
                traditional=word_data.get('trad', ''),
                simplified=word_data.get('simp', '')
            )
            
            # Get localized definition using Segmenter logic
            definition = Segmenter.get_definitions_by_language(cedict, target_language=language)
            word_data['definitions'] = definition
        except CEDictionary.DoesNotExist:
            # No definition found - leave undefined or use placeholder
            word_data['definitions'] = ''
        
        words.append(word_data)
    
    return {
        'id': reading_text.id,
        'book': reading_text.book,
        'title': reading_text.title,
        'words': words
    }


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
