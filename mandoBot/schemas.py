
from ninja import Schema, ModelSchema
from sentences.models import CEDictionary

class UserSchema(Schema):
  email: str

class WordSchema(Schema):
  word: str

class CEDictSchema(ModelSchema):
  class Meta:
    model = CEDictionary
    fields = ['traditional', 'simplified', 'pronunciation', 'definitions']
