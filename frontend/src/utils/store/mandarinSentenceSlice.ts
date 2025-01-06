import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MandarinSentenceType,
  emptySentence,
  ChineseDictionary,
  SegmentResponseType,
} from '../types';

interface MandarinSentenceState {
  mandarinSentence: MandarinSentenceType;
  mandarinDictionary: ChineseDictionary;
  isLoading: boolean;
}

const initialState: MandarinSentenceState = {
  mandarinSentence: emptySentence,
  mandarinDictionary: {},
  isLoading: false,
};

const mandarinSentenceSlice = createSlice({
  name: 'mandarinSentence',
  initialState,
  reducers: {
    appendToMandarinSentence(
      state,
      action: PayloadAction<MandarinSentenceType>,
    ) {
      state.mandarinSentence.translation += ' ' + action.payload.translation;
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
  },
});

export const {
  appendToMandarinSentence,
  clearMandarinSentence,
  appendToMandarinDictionary,
  clearMandarinDictionary,
  setLoading,
} = mandarinSentenceSlice.actions;
export default mandarinSentenceSlice.reducer;
