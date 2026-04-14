import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PronunciationPreference } from '../types';
import { UserLanguage } from '@/localization/main';

interface SettingsState {
  theme: 'light' | 'dark';
  pronunciation: 'pinyin' | 'zhuyin';
  pinyin_type: 'pinyin_acc' | 'pinyin_num';
  user_language: UserLanguage;
}

const getInitialUserLanguage = (): UserLanguage => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user_language');
    if (stored === 'en' || stored === 'de') return stored;
  }
  return 'en';
};

const initialState: SettingsState = {
  theme: 'dark',
  pronunciation: 'pinyin',
  pinyin_type: 'pinyin_acc',
  user_language: getInitialUserLanguage(),
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
    setUserLanguage(state, action: PayloadAction<UserLanguage>) {
      state.user_language = action.payload;
    },
    setPreferences(
      state,
      action: PayloadAction<{
        pronunciation_preference: PronunciationPreference;
        theme_preference: number;
        user_language: UserLanguage;
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
      state.user_language = action.payload.user_language;
    },
  },
});

export const {
  toggleTheme,
  togglePronunciation,
  togglePinyin,
  setUserLanguage,
  setPreferences,
} = settingsSlice.actions;
export default settingsSlice.reducer;
