from typing import List, TypedDict


class SentenceSegment(TypedDict):
    word: str
    pinyin: List[str]
    zhuyin: List[str]
    definitions: List[str]


class WordProperty(TypedDict):
    english: List[str]
    pinyin: List[str]
    zhuyin: List[str]


class MandarinDictionary(TypedDict):
    word: WordProperty


class SegmentedResult(TypedDict):
    translation: str
    sentence: List[SentenceSegment]
    dictionary: MandarinDictionary
