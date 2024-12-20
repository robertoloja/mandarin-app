from ninja import NinjaAPI
from typing import List

from accounts.models import CustomUser
from sentences.segmenters import DefaultSegmenter
from sentences.translators import DefaultTranslator
from .schemas import UserSchema, CEDictionary, CEDictSchema, WordSchema, SegmentationResponse

api = NinjaAPI()

@api.get("/users", response=List[UserSchema])
def get_users(request):
  return CustomUser.objects.all()

@api.post("/dictionary", response=List[CEDictSchema])
def dictionary(request, data: WordSchema):
  return list(CEDictionary.objects.filter(traditional=data.word))

@api.post("/translate", response=str)
def translate(request, data: str) -> str:
  return DefaultTranslator.translate(data)

@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str):
  segmented = DefaultSegmenter.segment_and_translate(data)

  # Adding definitions in the segmenter creates a circular import,
  # so it is done here.
  for i in range(len(segmented['sentence'])):
    word = segmented['sentence'][i]['word']
    defs = CEDictionary.objects.filter(traditional=word).values_list('definitions', flat=True)
    segmented['sentence'][i]['definitions'] = defs

  return segmented