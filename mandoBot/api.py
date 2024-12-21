from ninja import NinjaAPI
from django.db.models import Q

from dragonmapper import hanzi

from sentences.segmenters import DefaultSegmenter
from sentences.translators import DefaultTranslator
from .schemas import CEDictionary, SegmentationResponse

api = NinjaAPI()

@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str):
  if not hanzi.has_chinese(data):
    word = {
      "word": data,
      "pinyin": [data],
      "definitions":[],
      "dictionary": {"english": "", "pinyin": "", "simplified": ""}
    }
    return {
      "translation": data,
      "dictionary": {},
      "sentence": [word]
    }

  segmented = DefaultSegmenter.segment_and_translate(data)

  # Adding definitions in the segmenter creates a circular import, so it is done here.  
  for i in range(len(segmented['sentence'])):
    word = segmented['sentence'][i]['word']

    if not hanzi.has_chinese(word):
      continue

    defs = CEDictionary.objects\
                       .filter(Q(traditional=word) | Q(simplified=word))\
                       .values_list('definitions', flat=True)

    if len(defs) == 0:
      defs = [DefaultTranslator.translate(word).lower()]

    segmented['sentence'][i]['definitions'] = defs

  return segmented