import { createSlice } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark';
  pronunciation: 'pinyin' | 'zhuyin';
}

const initialState: SettingsState = {
  theme: 'light',
  pronunciation: 'pinyin',
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
  },
});

export const { toggleTheme, togglePronunciation } = settingsSlice.actions;
export default settingsSlice.reducer;
