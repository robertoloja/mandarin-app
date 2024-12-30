from typing import List
from ninja import Schema, ModelSchema
from sentences.models import CEDictionary


class MandarinWordSchema(Schema):
  word: str
  pinyin: List[str]
  definitions: List[str]
  dictionary: dict

class UserSchema(Schema):
  email: str

class WordSchema(Schema):
  word: str

class CEDictSchema(ModelSchema):
  class Meta:
    model = CEDictionary
    fields = ['traditional', 
              'simplified', 
              'pronunciation', 
              'definitions']

class SegmentationResponse(Schema):
  translation: str
  sentence: List[MandarinWordSchema]
