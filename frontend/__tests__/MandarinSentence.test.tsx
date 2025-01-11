import { MandarinSentenceClass } from '../src/app/MandarinSentenceClass';

describe('MandarinSentence', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  it('should instantiate with a mandarin sentence', () => {
    const instance = new MandarinSentenceClass('北京市，通稱北京，簡稱「京」');
    expect(instance.mandarin).toBe('北京市，通稱北京，簡稱「京」');
  });
});
