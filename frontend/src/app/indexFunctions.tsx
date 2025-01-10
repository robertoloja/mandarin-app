import {
  MandarinSentenceType,
  MandarinSentenceType,
  ChineseDictionary,
  SegmentResponseType,
} from '@/utils/types';

import { setShareLink } from '@/utils/store/mandarinSentenceSlice';
import { store } from '@/utils/store/store';
import { MandoBotAPI } from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/utils/store/store';

export const addToHistory = (
  mandarinSentence: MandarinSentenceType,
  mandarinDictionary: ChineseDictionary,
  shareLink: string,
) => {
  const existingHistory = localStorage.getItem('history');
  const sentenceHistory: MandarinSentenceType[] = existingHistory
    ? JSON.parse(existingHistory)
    : [];

  const newSentence: MandarinSentenceType = {
    sentence: mandarinSentence,
    dictionary: mandarinDictionary,
    shareURL: shareLink,
  };

  const isDuplicate =
    sentenceHistory.filter((x) => x.shareURL == newSentence.shareURL).length !==
    0;

  if (!isDuplicate) {
    sentenceHistory.push(newSentence);
  }

  localStorage.setItem('history', JSON.stringify(sentenceHistory));
  //TODO: Send to store in the API if logged-in
};

const getShareLink = async (
  mandarinSentence: MandarinSentenceType,
  mandarinDictionary: ChineseDictionary,
) => {
  const shareLink = useSelector((state: RootState) => state.sentence.shareLink);
  const dataToSend = {
    translation: mandarinSentence.translation,
    sentence: mandarinSentence.sentence,
    dictionary: mandarinDictionary,
  };

  await MandoBotAPI.share(dataToSend).then((response: string) => {
    store.dispatch(setShareLink(response));
    addToHistory(mandarinSentence, mandarinDictionary, response);
  });
};

const existsInStorage = (sentence: string): SegmentResponseType => {
  return false;
};
