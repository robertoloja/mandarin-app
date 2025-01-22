export type ChineseDictionary = Record<
  string,
  {
    english: string[];
    pinyin: string[];
    zhuyin: string[];
  }
>;

export type MandarinWordType = {
  word: string;
  pinyin: string[];
  zhuyin: string[];
  definitions: string[];
};

export type SegmentResponseType = {
  sentence: MandarinWordType[];
  dictionary: ChineseDictionary;
  translation: string;
};

export type MandarinSentenceType = {
  mandarin: string;
  segments: MandarinWordType[];
  dictionary: ChineseDictionary;
  translation: string;
  shareURL: string;
};

export type SentenceHistoryType = MandarinSentenceType & {
  date: Date;
};

export const emptySentence: MandarinSentenceType = {
  mandarin: '',
  segments: [],
  translation: '',
  dictionary: {},
  shareURL: '',
};

export type PronunciationPreference = 'zhuyin' | 'pinyin_acc' | 'pinyin_num';

export type UserPreferences = {
  username: string;
  email: string;
  pronunciation_preference: PronunciationPreference;
  theme_preference: 0 | 1;
};
