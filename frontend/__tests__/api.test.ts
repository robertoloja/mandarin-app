/**
 * API module tests
 * These are simple integration tests to verify API methods are callable
 * Full testing would require mocking axios at a higher level
 */

describe('MandoBotAPI imports', () => {
  it('should export MandoBotAPI object', () => {
    const { MandoBotAPI } = require('../src/utils/api');
    expect(MandoBotAPI).toBeDefined();
    expect(typeof MandoBotAPI).toBe('object');
  });

  it('should have login method', () => {
    const { MandoBotAPI } = require('../src/utils/api');
    expect(MandoBotAPI.login).toBeDefined();
    expect(typeof MandoBotAPI.login).toBe('function');
  });

  it('should have logout method', () => {
    const { MandoBotAPI } = require('../src/utils/api');
    expect(MandoBotAPI.logout).toBeDefined();
    expect(typeof MandoBotAPI.logout).toBe('function');
  });

  it('should have getUserSettings method', () => {
    const { MandoBotAPI } = require('../src/utils/api');
    expect(MandoBotAPI.getUserSettings).toBeDefined();
    expect(typeof MandoBotAPI.getUserSettings).toBe('function');
  });

  it('should have languagePreference method', () => {
    const { MandoBotAPI } = require('../src/utils/api');
    expect(MandoBotAPI.languagePreference).toBeDefined();
    expect(typeof MandoBotAPI.languagePreference).toBe('function');
  });
});
