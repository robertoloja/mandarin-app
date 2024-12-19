from ninja import NinjaAPI
from typing import List

from accounts.models import CustomUser
from .schemas import UserSchema, CEDictionary, CEDictSchema, WordSchema, SegmentationResponse

api = NinjaAPI()

@api.get("/users", response=List[UserSchema])
def get_users(request):
  return CustomUser.objects.all()

@api.post("/dictionary", response=List[CEDictSchema])
def dictionary(request, data: WordSchema):
  return list(CEDictionary.objects.filter(traditional=data.word))

@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str):
  return {
    "translation": "test translation",
    "dictionary": {
      "traditional": "這是一個測試句",
      "simplified": "这是一个测试句子",
      "pronunciation": "zhè shì yīgè cèshì jù",
      "definitions": ["this", "is", "a", "test", "sentence"]
    },
    "sentence": [{
      "word": "這",
      "pinyin": "zhè",
      "definitions": ["this"], 
      "dictionary": {
        "english": "this",
        "pinyin": "zhè",
        "simplified": "这"
      }
    }]
  }