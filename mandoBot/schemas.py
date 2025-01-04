from typing import List, Dict
from ninja import Schema, ModelSchema
from sentences.models import CEDictionary


class MandarinWordSchema(Schema):
    word: str
    pinyin: List[str]
    definitions: List[str | None]


class UserSchema(Schema):
    email: str


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


class SegmentationResponse(Schema):
    translation: str
    sentence: List[MandarinWordSchema]
    dictionary: dict
