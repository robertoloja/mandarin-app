import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PronunciationPreference } from '../types';

interface SettingsState {
  theme: 'light' | 'dark';
  pronunciation: 'pinyin' | 'zhuyin';
  pinyin_type: 'pinyin_acc' | 'pinyin_num';
}

const initialState: SettingsState = {
  theme: 'dark',
  pronunciation: 'pinyin',
  pinyin_type: 'pinyin_acc',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    togglePronunciation(state) {
      state.pronunciation =
        state.pronunciation === 'pinyin' ? 'zhuyin' : 'pinyin';
    },
    togglePinyin(state) {
      state.pinyin_type =
        state.pinyin_type === 'pinyin_acc' ? 'pinyin_num' : 'pinyin_acc';
    },
    setPreferences(
      state,
      action: PayloadAction<{
        pronunciation_preference: PronunciationPreference;
        theme_preference: number;
      }>,
    ) {
      if (action.payload.pronunciation_preference.startsWith('pinyin')) {
        state.pronunciation = 'pinyin';
        state.pinyin_type =
          action.payload.pronunciation_preference == 'pinyin_acc'
            ? 'pinyin_acc'
            : 'pinyin_num';
      } else {
        state.pronunciation = 'zhuyin';
      }
      if (action.payload.theme_preference == 1) {
        state.theme = 'light';
      } else {
        state.theme = 'dark';
      }
    },
  },
});

export const {
  toggleTheme,
  togglePronunciation,
  togglePinyin,
  setPreferences,
} = settingsSlice.actions;
export default settingsSlice.reducer;
