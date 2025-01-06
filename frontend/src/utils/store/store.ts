import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import authReducer from './authSlice';
import settingsReducer from './settingsSlice';
import mandarinSentenceSlice from './mandarinSentenceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    mandarinSentence: mandarinSentenceSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hook to use dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;
