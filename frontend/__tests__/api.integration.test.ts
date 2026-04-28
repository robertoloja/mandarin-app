/**
 * @jest-environment node
 */
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

describe('Backend API Integration Tests', () => {
  // Increase timeout for integration tests that hit the backend
  jest.setTimeout(15000);
  
  const testCredentials = {
    username: 'robertoloja',
    password: 'OZHk4L8G-SZJ2vHGAv-r',
  };

  // Shared cookies across requests
  let cookies: string[] = [];

  const makeRequest = async (method: string, url: string, data?: any, headers?: any) => {
    const config: any = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        ...(cookies.length > 0 && { 'Cookie': cookies.join('; ') }),
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    // Extract and store cookies from response
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      setCookie.forEach((cookie: string) => {
        const cookieName = cookie.split('=')[0];
        // Remove existing cookie with same name
        cookies = cookies.filter(c => !c.startsWith(cookieName + '='));
        // Add new cookie (just the name=value part, without extra attributes)
        cookies.push(cookie.split(';')[0]);
      });
    }

    return response;
  };

  it('should successfully run complete workflow', async () => {
    // 1. Login
    const loginResponse = await makeRequest(
      'POST',
      '/accounts/login',
      `username=${testCredentials.username}&password=${testCredentials.password}`,
      { 'Content-Type': 'application/x-www-form-urlencoded' }
    );
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data.username).toBe('robertoloja');
    expect(loginResponse.data.email).toBeTruthy();
    expect(loginResponse.data.user_language).toBeDefined();
    
    // 2. Get user settings
    const settingsResponse = await makeRequest('GET', '/accounts/user_settings');
    expect([200, 204]).toContain(settingsResponse.status);
    
    // 3. Update language preference to German
    const updateResponse = await makeRequest(
      'POST',
      '/accounts/language_preference',
      { language: 'de' },
      { 'Content-Type': 'application/json' }
    );
    
    expect([200, 204]).toContain(updateResponse.status);
    
    // 4. Verify language was updated
    const verifyResponse = await makeRequest('GET', '/accounts/user_settings');
    if (verifyResponse.status === 200) {
      expect(verifyResponse.data.user_language).toBe('de');
    }
    
    // 5. Reset language back to English
    await makeRequest(
      'POST',
      '/accounts/language_preference',
      { language: 'en' },
      { 'Content-Type': 'application/json' }
    );
    
    // 6. Logout
    const logoutResponse = await makeRequest('POST', '/accounts/logout');
    expect([200, 204]).toContain(logoutResponse.status);
  });
});
