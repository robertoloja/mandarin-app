import Pinyin from 'pinyin-tone';
import { ChineseDictionary } from './types';

export const TONE_DARK: Record<number, string> = {
  1: '#f07070',  // red
  2: '#45bb78',  // green
  3: '#7878ee',  // indigo
  4: '#c468e8',  // violet
  0: '#8c8c8c',  // neutral
};

export const TONE_LIGHT: Record<number, string> = {
  1: '#c03040',  // red
  2: '#2a7a48',  // green
  3: '#3838c0',  // indigo
  4: '#7828a8',  // violet
  0: '#747474',  // neutral
};

export const RUBY_COLOR_DARK = 'oklch(0.68 0.008 70)';
export const RUBY_COLOR_LIGHT = 'oklch(0.48 0.008 60)';

export function getTone(char: string, dict: ChineseDictionary): number {
  const py = dict[char]?.pinyin?.[0] ?? '';
  const m = py.match(/(\d)$/);
  if (!m) return 0;
  const t = parseInt(m[1]);
  return t === 5 ? 0 : t;
}

// A word is punctuation if it's empty, a newline, or an ASCII character that
// CEDICT encodes with itself as pinyin (e.g. "!" has pinyin ["!"]).
export function isPunct(word: string, pinyin: string[]): boolean {
  return (
    word === '' || word === '\n' || (pinyin.length > 0 && word === pinyin[0])
  );
}

export function getCharPron(
  c: string,
  dict: ChineseDictionary,
  pronunciationSetting: string,
  pinyinSetting: string,
): string {
  if (!dict[c]) return '';
  if (pronunciationSetting === 'pinyin') {
    if (pinyinSetting === 'pinyin_acc') {
      return Pinyin(dict[c].pinyin[0]?.toLowerCase() ?? '');
    }
    return dict[c].pinyin[0] ?? '';
  }
  return dict[c].zhuyin[0] ?? '';
}
