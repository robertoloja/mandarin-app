import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MandarinSentenceType,
  emptySentence,
  ChineseDictionary,
} from '../types';

interface MandarinSentenceState {
  mandarinSentence: MandarinSentenceType;
  mandarinDictionary: ChineseDictionary;
  isLoading: boolean;
  shareLink: string;
}

const initialState: MandarinSentenceState = {
  mandarinSentence: emptySentence,
  mandarinDictionary: {},
  isLoading: false,
  shareLink: '',
};

const mandarinSentenceSlice = createSlice({
  name: 'mandarinSentence',
  initialState,
  reducers: {
    appendToMandarinSentence(
      state,
      action: PayloadAction<MandarinSentenceType>,
    ) {
      state.mandarinSentence.translation += action.payload.translation + ' ';
      state.mandarinSentence.sentence = [
        ...state.mandarinSentence.sentence,
        ...action.payload.sentence,
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
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
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
  setLoading,
  setShareLink,
} = mandarinSentenceSlice.actions;
export default mandarinSentenceSlice.reducer;
