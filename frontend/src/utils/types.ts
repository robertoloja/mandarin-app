export type ChineseDictionary = Record<
  string,
  {
    english: string[];
    pinyin: string[];
  }
>;

export type MandarinWordType = {
  word: string;
  pinyin: string[];
  definitions: string[];
};

export const emptySentence: MandarinSentenceType = {
  translation: '',
  sentence: [] as MandarinWordType[],
};

export type MandarinSentenceType = {
  translation: string;
  sentence: MandarinWordType[];
};

export type SegmentResponseType = {
  translation: string;
  sentence: MandarinWordType[];
  dictionary: ChineseDictionary;
};
