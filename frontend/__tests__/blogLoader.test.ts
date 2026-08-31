import { stripComments } from '../src/utils/blog';

describe('stripComments', () => {
  it('removes a single-line HTML comment', () => {
    expect(stripComments('before <!-- note --> after')).toBe('before  after');
  });

  it('removes a multi-line comment block', () => {
    const body = 'Real prose.\n\n<!--\nnotes to self\nmore notes\n-->\n\nMore prose.';
    const out = stripComments(body);
    expect(out).not.toContain('notes to self');
    expect(out).toContain('Real prose.');
    expect(out).toContain('More prose.');
  });

  it('removes several comments in one document', () => {
    const out = stripComments('a <!-- one --> b <!-- two --> c');
    expect(out).not.toMatch(/one|two/);
  });

  it('leaves prose without comments untouched', () => {
    expect(stripComments('Nothing to strip here.')).toBe('Nothing to strip here.');
  });

  it('does not eat content between two separate comments', () => {
    expect(stripComments('<!-- a -->KEEP<!-- b -->')).toContain('KEEP');
  });
});

export {};
