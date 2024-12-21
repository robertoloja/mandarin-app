from ninja import NinjaAPI

from sentences.segmenters import DefaultSegmenter
from .schemas import CEDictionary, SegmentationResponse

api = NinjaAPI()

@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str):
  segmented = DefaultSegmenter.segment_and_translate(data)

  # Adding definitions in the segmenter creates 
  # a circular import, so it is done here.
  for i in range(len(segmented['sentence'])):
    word = segmented['sentence'][i]['word']
    defs = CEDictionary.objects.filter(traditional=word).values_list('definitions', flat=True) #TODO: Filter out definitions for other pronunciations.
    segmented['sentence'][i]['definitions'] = defs

  return segmented