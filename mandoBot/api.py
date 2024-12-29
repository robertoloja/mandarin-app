import string
import re
import uuid
from typing import Union
import json
import math

from ninja import NinjaAPI
from django.db.models import Q
from django.http import StreamingHttpResponse
from asgiref.sync import sync_to_async

from dragonmapper import hanzi

from sentences.segmenters import DefaultSegmenter
from sentences.translators import DefaultTranslator
from sentences.models import CEDictionary
from .schemas import SegmentationResponse

api = NinjaAPI()

pending_tasks = {}

@api.get("/segment", response=SegmentationResponse)
def segment_sse(request, taskId: str):
  parts_of_sentences = re.split(r'([。.])', pending_tasks[taskId]) # split on periods

  if len(parts_of_sentences) > 1:
    parts_of_sentences = [parts_of_sentences[i] + parts_of_sentences[i + 1]\
                          for i in range(0, len(parts_of_sentences) - 1, 2)] +\
                          ([parts_of_sentences[-1]] if len(parts_of_sentences) % 2 != 0 and parts_of_sentences[-1] else [])  # add back the periods

  async def send_sse_response():
    percentage_done = 0

    for i in range(len(parts_of_sentences)):
      percentage_done = percentage_done + math.floor(len(parts_of_sentences[i]) / len(pending_tasks[taskId]) * 100)
      segmented = await DefaultSegmenter.segment_and_translate(parts_of_sentences[i])
      segmented = await add_definitions(segmented)
      yield f"data: {json.dumps({'message': segmented, 'percent': percentage_done})}\n\n"
    yield "event: close\n\n"
    pending_tasks.pop(taskId)

  response = StreamingHttpResponse(send_sse_response(), content_type='text/event-stream')
  response['Cache-Control'] = 'no-cache'
  response['Transfer-Encoding'] = 'chunked'
  return response

@api.post("/segment", response=Union[SegmentationResponse, str])
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

  taskId = str(uuid.uuid4())

  pending_tasks[taskId] = data
  return taskId


async def add_definitions(segmented):
  # Adding definitions in the segmenter creates a circular import, so it is done here.  
  for i in range(len(segmented['sentence'])):
    word = segmented['sentence'][i]['word']

    if not hanzi.has_chinese(word):
      continue

    # Use sync_to_async to run the synchronous database query
    defs = await sync_to_async(lambda: list(
        CEDictionary.objects.filter(Q(traditional=word) | Q(simplified=word)).values_list('definitions', flat=True)
    ))()

    if len(defs) == 0:
      # Correctly await the translation and process the result
      translated_word = await sync_to_async(DefaultTranslator.translate)(word)
      defs = [translated_word.lower().translate(str.maketrans('', '', string.punctuation))]

    segmented['sentence'][i]['definitions'] = defs

    # Add dictionary of each individual hanzi
    dictionary = {}

    for single_hanzi in word:
      if single_hanzi in "、。？，：；《》【】（）［］！＠＃＄％＾＆＊－／＋＝－～":
        continue

      hanzi_defs = await sync_to_async(lambda: list(
          CEDictionary.objects.filter(Q(traditional=single_hanzi) | Q(simplified=single_hanzi)).values_list('definitions', 'pronunciation')
      ))()

      dictionary[single_hanzi] = {
        'english': hanzi_defs[0][0],
        'pinyin': hanzi_defs[0][1],
        'simplified': '',
      }
    segmented['sentence'][i]['dictionary'] = dictionary

  return segmented