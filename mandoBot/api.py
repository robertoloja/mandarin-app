from ninja import NinjaAPI, Schema
from typing import List

from accounts.models import CustomUser

api = NinjaAPI()

class UserSchema(Schema):
  email: str

@api.get("/hello")
def hello(request):
  return {"message": "Hello, world!"}

@api.get("/users", response=List[UserSchema])
def get_users(request):
  return CustomUser.objects.all()
