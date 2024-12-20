
from typing import List
from ninja import Schema, ModelSchema
from sentences.models import CEDictionary

class ChineseDictionary(Schema):
  english: str
  pinyin: str
  simplified: str

class MandarinWordSchema(Schema):
  word: str
  pinyin: str
  definitions: List[str]
  dictionary: ChineseDictionary

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
  dictionary: dict
  sentence: List[MandarinWordSchema]