from typing import List
from ninja import Schema, ModelSchema
from sentences.models import CEDictionary
from accounts.models import CustomUser


class MandarinWordSchema(Schema):
    word: str
    pinyin: List[str]
    definitions: List[str | None]


class UserSchema(ModelSchema):
    class Meta:
        model = CustomUser
        fields = ["username", "password"]


class WordSchema(Schema):
    word: str


class CEDictSchema(ModelSchema):
    class Meta:
        model = CEDictionary
        fields = ["traditional", "simplified", "pronunciation", "definitions"]


class Translation(Schema):
    english: List[str]
    pinyin: List[str]
    definitions: List[str]


class ChineseDictionary(Schema):
    english: List[str]
    pinyin: List[str]


class SegmentationRequest(Schema):
    sentence: str


class SegmentationResponse(Schema):
    translation: str
    sentence: List[MandarinWordSchema]
    dictionary: dict
