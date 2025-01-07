from django.contrib.auth import authenticate, login, logout
from ninja import NinjaAPI
from dragonmapper import hanzi
import json

from sentences.segmenters import DefaultSegmenter
from .schemas import SegmentationResponse, SegmentationRequest, UserSchema
from sentences.models import SentenceHistory

api = NinjaAPI()

emptyResponse = {
    "translation": "",
    "dictionary": {"word": {"english": [], "pinyin": []}},
    "sentence": [{"word": "", "pinyin": [], "definitions": []}],
}


@api.post("/login")
def login_endpoint(request, payload: UserSchema) -> str:
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        login(request, user)
        return "success"
    else:
        return "failed"


@api.post("/logout")
def logout_view(request) -> str:
    logout(request)
    return "success"


@api.get("/shared", response=SegmentationResponse)
async def retrieve_shared(request, share_id):
    db_entry = await SentenceHistory.objects.aget(sentence_id=share_id)
    # TODO: Error handling
    return json.loads(db_entry.json_data)


@api.post("/share", response=str)
async def share(request, data: SegmentationResponse) -> str:
    db_entry, _ = await SentenceHistory.objects.aget_or_create(json_data=data.dict())
    return db_entry.sentence_id


@api.post("/segment", response=SegmentationResponse)
async def segment(request, data: SegmentationRequest) -> SegmentationResponse:
    if not data.sentence:
        return emptyResponse

    if not hanzi.has_chinese(data.sentence):
        return handle_non_chinese(data.sentence)

    segmented_data = await DefaultSegmenter.segment_and_translate(data.sentence)
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
