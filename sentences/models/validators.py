from django.core.exceptions import ValidationError
from dragonmapper import hanzi

def is_traditional(word: str):
    if not hanzi.is_traditional(word):
        raise ValidationError(f'{word} is not a traditional word.')

def is_simplified(word: str):
    if not hanzi.is_simplified(word):
        raise ValidationError(f'{word} is not a simplified word.')

def has_chinese(sentence: str):
    if not hanzi.has_chinese(sentence):
        raise ValidationError(f'Sentence has no chinese in it: {sentence}')

def is_pinyin(sentence: str):
    if not hanzi.is_pinyin(sentence):
        raise ValidationError(f'Sentence is not pinyin: {sentence}')