import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock next/navigation before importing slices
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the API module to prevent circular dependencies
jest.mock('../src/utils/api', () => ({
  MandoBotAPI: {
    login: jest.fn(),
    logout: jest.fn(),
    segment: jest.fn(),
    share: jest.fn(),
    shared: jest.fn(),
    status: jest.fn(),
    register: jest.fn(),
    getUserSettings: jest.fn(),
    pronunciationPreference: jest.fn(),
    themePreference: jest.fn(),
    languagePreference: jest.fn(),
    changePassword: jest.fn(),
    resetPasswordRequest: jest.fn(),
    resetPassword: jest.fn(),
  },
  getCookie: jest.fn(),
}));

import authReducer from '../src/utils/store/authSlice';
import settingsReducer from '../src/utils/store/settingsSlice';
import errorReducer from '../src/utils/store/errorSlice';
import loadingReducer from '../src/utils/store/loadingSlice';
import mandarinSentenceReducer from '../src/utils/store/mandarinSentenceSlice';

describe('LoginComponent', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        settings: settingsReducer,
        errors: errorReducer,
        loading: loadingReducer,
        sentence: mandarinSentenceReducer,
      },
    });
  });

  it('should render login form', () => {
    const LoginComponent = require('../src/app/auth/components/LoginComponent').default;
    
    render(
      <Provider store={store}>
        <LoginComponent />
      </Provider>
    );

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/username/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show Logging in when button is disabled', () => {
    const LoginComponent = require('../src/app/auth/components/LoginComponent').default;
    
    // Create a store with loading state
    const loadingStore = configureStore({
      reducer: {
        auth: authReducer,
        settings: settingsReducer,
        errors: errorReducer,
        loading: loadingReducer,
        sentence: mandarinSentenceReducer,
      },
      preloadedState: {
        auth: {
          username: null,
          email: null,
          loading: true,
          error: null,
        },
      },
    });

    render(
      <Provider store={loadingStore}>
        <LoginComponent />
      </Provider>
    );

    const button = screen.getByRole('button', { name: /logging in/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Logging in...');
  });

  it('should update input fields when user types', () => {
    const LoginComponent = require('../src/app/auth/components/LoginComponent').default;
    
    render(
      <Provider store={store}>
        <LoginComponent />
      </Provider>
    );

    const usernameInput = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });
});
