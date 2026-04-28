import { UserLanguage } from '@/localization/main';

export type ChineseDictionary = Record<
  string,
  {
    en: string[];
    de: string[];
    pinyin: string[];
    zhuyin: string[];
  }
>;

export type MandarinWordType = {
  word: string;
  pinyin: string[];
  zhuyin: string[];
  definitions: Record<string, string[]>;
};

export type SegmentResponseType = {
  sentence: MandarinWordType[];
  dictionary: ChineseDictionary;
  translations: Record<string, string>;
};

export type MandarinSentenceType = {
  mandarin: string;
  segments: MandarinWordType[];
  dictionary: ChineseDictionary;
  translations: Record<string, string>;
  shareURL: string;
};

export type SentenceHistoryType = MandarinSentenceType & {
  date: Date;
};

export const emptySentence: MandarinSentenceType = {
  mandarin: '',
  segments: [],
  translations: {},
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
