
from ninja import Schema, ModelSchema
from sentences.models import ECDictionary

class UserSchema(Schema):
  email: str

class WordSchema(Schema):
  word: str

class ECDictSchema(ModelSchema):
  class Meta:
    model = ECDictionary
    fields = ['traditional', 'simplified', 'pronunciation', 'definitions']
