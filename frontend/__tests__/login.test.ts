import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import authReducer, { login } from '../src/utils/store/authSlice';
import { RootState } from '../src/utils/store/store';
import * as api from '../src/utils/api';

// Mock the api module
jest.mock('../src/utils/api');

describe('Login Redux Flow', () => {
  let store: any;

  const preloadedState: PreloadedState<RootState> = {
    auth: {
      username: null,
      email: null,
      loading: false,
      error: null,
    },
    settings: {
      theme: 'dark',
      pronunciation: 'pinyin',
      pinyin_type: 'pinyin_acc',
      user_language: 'en',
    },
    error: {
      message: null,
    },
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: preloadedState.auth,
      },
    });
    jest.clearAllMocks();
  });

  describe('login thunk', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        username: 'robertoloja',
        email: 'robertoloja@gmail.com',
        pronunciation_preference: 'pinyin_acc',
        theme_preference: 0,
        user_language: 'en',
      };

      (api.MandoBotAPI.login as jest.Mock).mockResolvedValue(mockResponse);

      await store.dispatch(
        login({ username: 'robertoloja', password: 'OZHk4L8G-SZJ2vHGAv-r' })
      );

      const state = store.getState().auth;
      expect(state.username).toBe('robertoloja');
      expect(state.email).toBe('robertoloja@gmail.com');
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle failed login with invalid credentials', async () => {
      const mockError = {
        response: {
          data: { error: 'Invalid credentials' },
        },
      };

      (api.MandoBotAPI.login as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(
        login({ username: 'foo', password: 'bar' })
      );

      const state = store.getState().auth;
      expect(state.username).toBe(null);
      expect(state.error).toBe('Invalid credentials');
      expect(state.loading).toBe(false);
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');

      (api.MandoBotAPI.login as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(
        login({ username: 'robertoloja', password: 'password' })
      );

      const state = store.getState().auth;
      expect(state.username).toBe(null);
      expect(state.error).toBe('Login failed');
      expect(state.loading).toBe(false);
    });

    it('should set loading to true while login is pending', async () => {
      (api.MandoBotAPI.login as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Dispatch the thunk but don't await
      const promise = store.dispatch(
        login({ username: 'robertoloja', password: 'password' })
      );

      // Check state immediately (before API call completes)
      let state = store.getState().auth;
      expect(state.loading).toBe(true);

      // Clean up the pending promise
      try {
        await Promise.race([promise, new Promise(r => setTimeout(r, 100))]);
      } catch {
        // Ignore
      }
    });
  });

  describe('auth reducer', () => {
    it('should set username and email on successful login', () => {
      const initialState = store.getState().auth;
      expect(initialState.username).toBe(null);

      // Manually dispatch the fulfilled action
      store.dispatch(
        login.fulfilled(
          {
            username: 'testuser',
            email: 'test@example.com',
            pronunciation_preference: 'pinyin_acc',
            theme_preference: 0,
            user_language: 'en',
          },
          'requestId',
          { username: '', password: '' }
        )
      );

      const state = store.getState().auth;
      expect(state.username).toBe('testuser');
      expect(state.email).toBe('test@example.com');
      expect(state.loading).toBe(false);
    });

    it('should clear user data on logout', () => {
      // First set user data
      store.dispatch(
        login.fulfilled(
          {
            username: 'testuser',
            email: 'test@example.com',
            pronunciation_preference: 'pinyin_acc',
            theme_preference: 0,
            user_language: 'en',
          },
          'requestId',
          { username: '', password: '' }
        )
      );

      // Verify user is logged in
      let state = store.getState().auth;
      expect(state.username).toBe('testuser');

      // Now test logout action if it exists
      // (Import logout and dispatch it)
      const { logout } = require('../src/utils/store/authSlice');
      store.dispatch(logout());

      state = store.getState().auth;
      expect(state.username).toBe(null);
      expect(state.email).toBe(null);
      expect(state.error).toBe(null);
    });
  });
});
