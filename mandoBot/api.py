from ninja import NinjaAPI
from typing import List

from accounts.models import CustomUser
from .schemas import UserSchema, ECDictionary, ECDictSchema, WordSchema

api = NinjaAPI()

@api.get("/users", response=List[UserSchema])
def get_users(request):
  return CustomUser.objects.all()

@api.post("/dictionary", response=List[ECDictSchema])
def dictionary(request, data: WordSchema):
  return list(ECDictionary.objects.filter(traditional=data.word))
