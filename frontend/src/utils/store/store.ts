import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import settingsReducer from './settingsSlice';
import mandarinSentenceSlice from './mandarinSentenceSlice';
import errorSlice from './errorSlice';
import loadingSlice from './loadingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    sentence: mandarinSentenceSlice,
    errors: errorSlice,
    loading: loadingSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
