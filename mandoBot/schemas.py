from typing import List, Dict
from ninja import Schema, ModelSchema
from accounts.models import CustomUser


class MandarinWordSchema(Schema):
    word: str
    pinyin: List[str]
    # zhuyin: List[str]
    definitions: List[str | None]


class UserSchema(ModelSchema):
    class Meta:
        model = CustomUser
        fields = ["username", "password"]


class WordSchema(Schema):
    word: str


class ChineseDictionary(Schema):
    english: List[str]
    pinyin: List[str]


class SegmentationResponse(Schema):
    translation: str
    sentence: List[MandarinWordSchema]
    dictionary: Dict[str, ChineseDictionary]
