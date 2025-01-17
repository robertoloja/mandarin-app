from typing import List, Dict
from ninja import Schema, ModelSchema
from accounts.models import MandoBotUser
from status.models import ServerStatus


class ServerStatusSchema(ModelSchema):
    class Meta:
        model = ServerStatus
        fields = ["updated_at", "translation_backend", "mandobot_response_time"]


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


class KofiDataSchema(Schema):
    verification_token: str
    message_id: str
    timestamp: str  # actually a datetime?
    type: str  # "Donation" or "Subscription"
    is_public: bool
    from_name: str
    message: str
    amount: str  # money amount
    url: str
    email: str  # actually an email
    currency: str  # should be "USD"
    is_subscription_payment: bool
    is_first_subscription_payment: bool
    kofi_transaction_id: str
    shop_items: None | str
    tier_name: None | str
    shipping: None | str
