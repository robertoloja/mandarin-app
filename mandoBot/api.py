from ninja import NinjaAPI
from dragonmapper import hanzi
import json

from sentences.segmenters import DefaultSegmenter
from .schemas import SegmentationResponse
from sentences.models import SentenceHistory

api = NinjaAPI()

emptyResponse = {
    "translation": "",
    "dictionary": {"word": {"english": [], "pinyin": []}},
    "sentence": [{"word": "", "pinyin": [], "definitions": []}],
}


@api.get("/shared", response=SegmentationResponse)
async def retrieve_shared(request, share_id):
    db_entry = SentenceHistory.objects.get(sentence_id=share_id)
    # TODO: Error handling
    return json.loads(db_entry.json_data)


@api.post("/share", response=str)
async def share(request, data: SegmentationResponse) -> str:
    db_entry, _ = SentenceHistory.objects.get_or_create(json_data=data.dict())
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
        "definitions": [],
    }

    return {
        "translation": data,
        "sentence": [word],
        "dictionary": {"word": {"english": [], "pinyin": []}},
    }
