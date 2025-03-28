from typing import List, Dict, Literal
from ninja import Schema, ModelSchema
from accounts.models import MandoBotUser
from status.models import ServerStatus


class ServerStatusSchema(ModelSchema):
    class Meta:
        model = ServerStatus
        fields = ["updated_at", "translation_backend", "mandobot_response_time"]


class UserSchema(ModelSchema):
    username: str
    password: str

    class Meta:
        model = MandoBotUser
        fields = ["username", "password"]


class ChangePasswordSchema(UserSchema):
    new_password: str
    password_confirmation: str


class UserPreferencesSchema(ModelSchema):
    class Meta:
        model = MandoBotUser
        fields = [
            "username",
            "email",
            "pronunciation_preference",
            "theme_preference",
        ]


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


class APIError(Schema):
    error: str


class APIPasswordError(Schema):
    error: List[str]


class RegisterSchema(Schema):
    username: str
    email: str
    password: str


class SuccessResponseSchema(Schema):
    message: str


class PronunciationPreferenceSchema(Schema):
    preference: Literal["zhuyin", "pinyin_acc", "pinyin_num"]
