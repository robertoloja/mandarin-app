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
  translationPanelHeight: number;
}

const initialState: MandarinSentenceState = {
  mandarinSentence: emptySentence,
  mandarinDictionary: {} as ChineseDictionary,
  shareLink: '',
  translationPanelHeight: 300,
};

const mandarinSentenceSlice = createSlice({
  name: 'mandarinSentence',
  initialState,
  reducers: {
    appendToMandarinSentence(
      state,
      action: PayloadAction<{
        mandarin: string;
        translations: Record<string, string>;
        segments: MandarinWordType[];
      }>,
    ) {
      const isFirst =
        Object.keys(state.mandarinSentence.translations).length === 0;

      state.mandarinSentence.mandarin = action.payload.mandarin; // never append

      for (const [lang, text] of Object.entries(action.payload.translations)) {
        const prefix = isFirst ? '' : ' ';
        state.mandarinSentence.translations[lang] =
          (state.mandarinSentence.translations[lang] ?? '') + prefix + text;
      }

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
    setTranslationPanelHeight(state, action: PayloadAction<number>) {
      state.translationPanelHeight = action.payload;
    },
  },
});

export const {
  appendToMandarinSentence,
  clearMandarinSentence,
  appendToMandarinDictionary,
  clearMandarinDictionary,
  setShareLink,
  setTranslationPanelHeight,
} = mandarinSentenceSlice.actions;
export default mandarinSentenceSlice.reducer;
