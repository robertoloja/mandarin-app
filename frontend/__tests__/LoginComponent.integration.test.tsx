import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Setup environment for api.ts to work
process.env.NODE_ENV = 'development';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Import reducers
import authReducer from '../src/utils/store/authSlice';
import settingsReducer from '../src/utils/store/settingsSlice';
import errorReducer from '../src/utils/store/errorSlice';
import loadingReducer from '../src/utils/store/loadingSlice';
import mandarinSentenceReducer from '../src/utils/store/mandarinSentenceSlice';

// Now we can safely import the API (no circular dependency here)
import { MandoBotAPI } from '../src/utils/api';

describe('LoginComponent Integration Test', () => {
  it('should successfully call login API with valid credentials', async () => {
    const response = await MandoBotAPI.login('robertoloja', 'OZHk4L8G-SZJ2vHGAv-r');
    
    expect(response).toBeDefined();
    expect(response.username).toBe('robertoloja');
    expect(response.email).toBeTruthy();
    expect(response.user_language).toBeDefined();
  });

  it('should fail login API with invalid credentials', async () => {
    try {
      await MandoBotAPI.login('invaliduser', 'wrongpassword');
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it('should fetch user settings via API', async () => {
    // First login to get a session
    await MandoBotAPI.login('robertoloja', 'OZHk4L8G-SZJ2vHGAv-r');
    
    // Then fetch user settings
    const settings = await MandoBotAPI.getUserSettings();
    
    expect(settings).toBeDefined();
    expect(settings.username).toBe('robertoloja');
    expect(settings.user_language).toBeDefined();
  });

  it('should update language preference via API', async () => {
    // Login first
    await MandoBotAPI.login('robertoloja', 'OZHk4L8G-SZJ2vHGAv-r');
    
    // Update language preference
    const result = await MandoBotAPI.languagePreference('de');
    
    expect(result).toBe(true);
    
    // Verify it was updated
    const settings = await MandoBotAPI.getUserSettings();
    expect(settings.user_language).toBe('de');
    
    // Reset it back
    await MandoBotAPI.languagePreference('en');
  });
});
