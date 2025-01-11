import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MandarinSentenceType,
  ChineseDictionary,
  MandarinWordType,
  emptySentence,
} from '../types';

interface MandarinSentenceState {
  mandarinSentence: MandarinSentenceType;
  mandarinDictionary: ChineseDictionary;
  shareLink: string;
}

const initialState: MandarinSentenceState = {
  mandarinSentence: emptySentence,
  mandarinDictionary: {} as ChineseDictionary,
  shareLink: '',
};

const mandarinSentenceSlice = createSlice({
  name: 'mandarinSentence',
  initialState,
  reducers: {
    appendToMandarinSentence(
      state,
      action: PayloadAction<{
        mandarin: string;
        translation: string;
        segments: MandarinWordType[];
      }>,
    ) {
      let translation = '';

      if (state.mandarinSentence.translation !== '') {
        translation = action.payload.translation;
      } else {
        translation = ' ' + action.payload.translation;
      }

      state.mandarinSentence.mandarin = action.payload.mandarin; // never append

      state.mandarinSentence.translation += translation;
      state.mandarinSentence.segments = [
        ...state.mandarinSentence.segments,
        ...action.payload.segments,
      ];
    },
    clearMandarinSentence(state) {
      state.mandarinSentence = emptySentence;
    },
    appendToMandarinDictionary(
      state,
      action: PayloadAction<ChineseDictionary>,
    ) {
      state.mandarinDictionary = {
        ...state.mandarinDictionary,
        ...action.payload,
      };
    },
    clearMandarinDictionary(state) {
      state.mandarinDictionary = {};
    },
    setShareLink(state, action: PayloadAction<string>) {
      state.shareLink = action.payload;
    },
  },
});

export const {
  appendToMandarinSentence,
  clearMandarinSentence,
  appendToMandarinDictionary,
  clearMandarinDictionary,
  setShareLink,
} = mandarinSentenceSlice.actions;
export default mandarinSentenceSlice.reducer;
