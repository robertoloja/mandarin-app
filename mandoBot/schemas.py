from typing import List, Dict
from ninja import Schema, ModelSchema
from accounts.models import MandoBotUser


class UserSchema(ModelSchema):
    class Meta:
        model = MandoBotUser
        fields = ["username", "password"]


class ChineseDictionary(Schema):
    english: List[str]
    pinyin: List[str]
    zhuyin: List[str]


class MandarinWordSchema(Schema):
    word: str
    pinyin: List[str]
    zhuyin: List[str]
    definitions: List[str]


class SegmentationResponse(Schema):
    translation: str
    sentence: List[MandarinWordSchema]
    dictionary: Dict[str, ChineseDictionary]
