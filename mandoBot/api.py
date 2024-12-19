from ninja import NinjaAPI
from typing import List

from accounts.models import CustomUser
from .schemas import UserSchema, CEDictionary, CEDictSchema, WordSchema

api = NinjaAPI()

@api.get("/users", response=List[UserSchema])
def get_users(request):
  return CustomUser.objects.all()

@api.post("/dictionary", response=List[CEDictSchema])
def dictionary(request, data: WordSchema):
  return list(CEDictionary.objects.filter(traditional=data.word))
