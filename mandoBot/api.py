import string
from ninja import NinjaAPI
from django.db.models import Q
from dragonmapper import hanzi
from sentences.segmenters import DefaultSegmenter
from sentences.translators import DefaultTranslator
from sentences.models import CEDictionary
from .schemas import SegmentationResponse

api = NinjaAPI()

@api.post("/segment", response=SegmentationResponse)
def segment(request, data: str) -> dict:
    if not hanzi.has_chinese(data):
        return handle_non_chinese(data)
    
    segmented_data = segment_and_translate(data)
    return segmented_data

# Utility functions
def handle_non_chinese(data: str) -> dict:
    """
    When the "word" and the only item in "sentence" are equal,
    the frontend recognizes that this is punctuation.
    """
    word = {
        "word": data,
        "pinyin": [data],
        "definitions": [],
        "dictionary": {"english": "", "pinyin": "", "simplified": ""}
    }
    return {
        "translation": data,
        "dictionary": {},
        "sentence": [word]
    }

def segment_and_translate(data: str) -> dict:
    segmented = DefaultSegmenter.segment_and_translate(data)
    return add_definitions(segmented)

def add_definitions(segmented: dict) -> dict:
    for i, segment in enumerate(segmented['sentence']):
        word = segment['word']
        if hanzi.has_chinese(word):
            defs = get_definitions(word)
            segmented['sentence'][i]['definitions'] = defs
            segmented['sentence'][i]['dictionary'] = get_hanzi_dictionary(word)
    return segmented

def get_definitions(word: str) -> list:
    defs = CEDictionary.objects\
        .filter(Q(traditional=word) | Q(simplified=word))\
        .values_list('definitions', flat=True)

    if not defs:
        translated_word = DefaultTranslator.translate(word)
        return [
            translated_word.lower()\
              .translate(str.maketrans('', '', string.punctuation))
          ]

    return defs

def get_hanzi_dictionary(word: str) -> dict:
    dictionary = {}
    for single_hanzi in word:
        if single_hanzi in "、。？，：；《》【】（）［］！＠＃＄％＾＆＊－／＋＝－～":
            continue

        hanzi_defs = CEDictionary.objects\
            .filter(Q(traditional=single_hanzi) | Q(simplified=single_hanzi))\
            .values_list('definitions', 'pronunciation')

        dictionary[single_hanzi] = {
            'english': hanzi_defs[0][0],
            'pinyin': hanzi_defs[0][1],
            'simplified': '',
        }
    return dictionary