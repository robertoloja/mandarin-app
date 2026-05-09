import Pinyin from 'pinyin-tone';
import { ChineseDictionary } from './types';

export const TONE_DARK: Record<number, string> = {
  1: 'oklch(0.78 0.13 25)',
  2: 'oklch(0.82 0.12 75)',
  3: 'oklch(0.80 0.13 145)',
  4: 'oklch(0.78 0.11 250)',
  0: 'oklch(0.65 0.005 60)',
};

export const TONE_LIGHT: Record<number, string> = {
  1: 'oklch(0.50 0.16 25)',
  2: 'oklch(0.55 0.14 75)',
  3: 'oklch(0.48 0.14 145)',
  4: 'oklch(0.48 0.13 250)',
  0: 'oklch(0.42 0.005 60)',
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
