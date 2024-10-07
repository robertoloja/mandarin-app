from ninja import NinjaAPI, Schema, ModelSchema
from typing import List

from accounts.models import CustomUser
from sentences.models import ECDictionary

api = NinjaAPI()

class UserSchema(Schema):
  email: str

class WordSchema(Schema):
  word: str

class ECDictSchema(ModelSchema):
  class Meta:
    model = ECDictionary
    fields = ['definitions']

@api.get("/hello")
def hello(request):
  return {"message": "Hello, world!"}

@api.get("/users", response=List[UserSchema])
def get_users(request):
  return CustomUser.objects.all()

@api.post("/dictionary", response=List[ECDictSchema])
def dictionary(request, data: WordSchema):
  return list(ECDictionary.objects.filter(traditional=data.word))
