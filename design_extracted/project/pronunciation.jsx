// pronunciation.jsx — Helpers for displaying pinyin in three systems:
//   accented (yuèguāng), numbered (yue4 guang1), zhuyin (ㄩㄝˋ ㄍㄨㄤ)
// Source of truth on each word/hanzi is `pyArr` — array of accented-pinyin
// syllables, one per character. Tones are still tracked separately in `t`.

const TONE_VOWELS = {
  'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
  'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
  'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
  'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
  'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
  'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4],
};

// Strip the tone diacritic from a single accented syllable, returning [plain, tone].
function _splitSyllable(syl) {
  let plain = '';
  let tone = 0;
  for (const ch of syl) {
    if (TONE_VOWELS[ch]) {
      plain += TONE_VOWELS[ch][0];
      tone = TONE_VOWELS[ch][1];
    } else {
      plain += ch;
    }
  }
  return [plain, tone];
}

// Bopomofo (zhuyin) lookup keyed by un-toned plain pinyin syllable.
// Covers every syllable that appears in our reader corpus + common ones.
const ZHUYIN_MAP = {
  a:'ㄚ', ai:'ㄞ', an:'ㄢ', ang:'ㄤ', ao:'ㄠ',
  ba:'ㄅㄚ', bai:'ㄅㄞ', ban:'ㄅㄢ', bang:'ㄅㄤ', bao:'ㄅㄠ',
  bei:'ㄅㄟ', ben:'ㄅㄣ', beng:'ㄅㄥ', bi:'ㄅㄧ', bian:'ㄅㄧㄢ',
  biao:'ㄅㄧㄠ', bie:'ㄅㄧㄝ', bin:'ㄅㄧㄣ', bing:'ㄅㄧㄥ', bo:'ㄅㄛ', bu:'ㄅㄨ',
  ca:'ㄘㄚ', cai:'ㄘㄞ', can:'ㄘㄢ', cang:'ㄘㄤ', cao:'ㄘㄠ',
  ce:'ㄘㄜ', cen:'ㄘㄣ', ceng:'ㄘㄥ', cha:'ㄔㄚ', chai:'ㄔㄞ',
  chan:'ㄔㄢ', chang:'ㄔㄤ', chao:'ㄔㄠ', che:'ㄔㄜ', chen:'ㄔㄣ',
  cheng:'ㄔㄥ', chi:'ㄔ', chong:'ㄔㄨㄥ', chou:'ㄔㄡ', chu:'ㄔㄨ',
  chuai:'ㄔㄨㄞ', chuan:'ㄔㄨㄢ', chuang:'ㄔㄨㄤ', chui:'ㄔㄨㄟ', chun:'ㄔㄨㄣ',
  chuo:'ㄔㄨㄛ', ci:'ㄘ', cong:'ㄘㄨㄥ', cou:'ㄘㄡ', cu:'ㄘㄨ',
  cuan:'ㄘㄨㄢ', cui:'ㄘㄨㄟ', cun:'ㄘㄨㄣ', cuo:'ㄘㄨㄛ',
  da:'ㄉㄚ', dai:'ㄉㄞ', dan:'ㄉㄢ', dang:'ㄉㄤ', dao:'ㄉㄠ',
  de:'ㄉㄜ', dei:'ㄉㄟ', deng:'ㄉㄥ', di:'ㄉㄧ', dian:'ㄉㄧㄢ',
  diao:'ㄉㄧㄠ', die:'ㄉㄧㄝ', ding:'ㄉㄧㄥ', diu:'ㄉㄧㄡ', dong:'ㄉㄨㄥ',
  dou:'ㄉㄡ', du:'ㄉㄨ', duan:'ㄉㄨㄢ', dui:'ㄉㄨㄟ', dun:'ㄉㄨㄣ', duo:'ㄉㄨㄛ',
  e:'ㄜ', en:'ㄣ', er:'ㄦ',
  fa:'ㄈㄚ', fan:'ㄈㄢ', fang:'ㄈㄤ', fei:'ㄈㄟ', fen:'ㄈㄣ',
  feng:'ㄈㄥ', fo:'ㄈㄛ', fou:'ㄈㄡ', fu:'ㄈㄨ',
  ga:'ㄍㄚ', gai:'ㄍㄞ', gan:'ㄍㄢ', gang:'ㄍㄤ', gao:'ㄍㄠ',
  ge:'ㄍㄜ', gei:'ㄍㄟ', gen:'ㄍㄣ', geng:'ㄍㄥ', gong:'ㄍㄨㄥ',
  gou:'ㄍㄡ', gu:'ㄍㄨ', gua:'ㄍㄨㄚ', guai:'ㄍㄨㄞ', guan:'ㄍㄨㄢ',
  guang:'ㄍㄨㄤ', gui:'ㄍㄨㄟ', gun:'ㄍㄨㄣ', guo:'ㄍㄨㄛ',
  ha:'ㄏㄚ', hai:'ㄏㄞ', han:'ㄏㄢ', hang:'ㄏㄤ', hao:'ㄏㄠ',
  he:'ㄏㄜ', hei:'ㄏㄟ', hen:'ㄏㄣ', heng:'ㄏㄥ', hong:'ㄏㄨㄥ',
  hou:'ㄏㄡ', hu:'ㄏㄨ', hua:'ㄏㄨㄚ', huai:'ㄏㄨㄞ', huan:'ㄏㄨㄢ',
  huang:'ㄏㄨㄤ', hui:'ㄏㄨㄟ', hun:'ㄏㄨㄣ', huo:'ㄏㄨㄛ',
  ji:'ㄐㄧ', jia:'ㄐㄧㄚ', jian:'ㄐㄧㄢ', jiang:'ㄐㄧㄤ', jiao:'ㄐㄧㄠ',
  jie:'ㄐㄧㄝ', jin:'ㄐㄧㄣ', jing:'ㄐㄧㄥ', jiong:'ㄐㄩㄥ', jiu:'ㄐㄧㄡ',
  ju:'ㄐㄩ', juan:'ㄐㄩㄢ', jue:'ㄐㄩㄝ', jun:'ㄐㄩㄣ',
  ka:'ㄎㄚ', kai:'ㄎㄞ', kan:'ㄎㄢ', kang:'ㄎㄤ', kao:'ㄎㄠ',
  ke:'ㄎㄜ', ken:'ㄎㄣ', keng:'ㄎㄥ', kong:'ㄎㄨㄥ', kou:'ㄎㄡ',
  ku:'ㄎㄨ', kua:'ㄎㄨㄚ', kuai:'ㄎㄨㄞ', kuan:'ㄎㄨㄢ', kuang:'ㄎㄨㄤ',
  kui:'ㄎㄨㄟ', kun:'ㄎㄨㄣ', kuo:'ㄎㄨㄛ',
  la:'ㄌㄚ', lai:'ㄌㄞ', lan:'ㄌㄢ', lang:'ㄌㄤ', lao:'ㄌㄠ',
  le:'ㄌㄜ', lei:'ㄌㄟ', leng:'ㄌㄥ', li:'ㄌㄧ', lia:'ㄌㄧㄚ',
  lian:'ㄌㄧㄢ', liang:'ㄌㄧㄤ', liao:'ㄌㄧㄠ', lie:'ㄌㄧㄝ', lin:'ㄌㄧㄣ',
  ling:'ㄌㄧㄥ', liu:'ㄌㄧㄡ', long:'ㄌㄨㄥ', lou:'ㄌㄡ', lu:'ㄌㄨ',
  lü:'ㄌㄩ', luan:'ㄌㄨㄢ', lüe:'ㄌㄩㄝ', lun:'ㄌㄨㄣ', luo:'ㄌㄨㄛ',
  ma:'ㄇㄚ', mai:'ㄇㄞ', man:'ㄇㄢ', mang:'ㄇㄤ', mao:'ㄇㄠ',
  me:'ㄇㄜ', mei:'ㄇㄟ', men:'ㄇㄣ', meng:'ㄇㄥ', mi:'ㄇㄧ',
  mian:'ㄇㄧㄢ', miao:'ㄇㄧㄠ', mie:'ㄇㄧㄝ', min:'ㄇㄧㄣ', ming:'ㄇㄧㄥ',
  miu:'ㄇㄧㄡ', mo:'ㄇㄛ', mou:'ㄇㄡ', mu:'ㄇㄨ',
  na:'ㄋㄚ', nai:'ㄋㄞ', nan:'ㄋㄢ', nang:'ㄋㄤ', nao:'ㄋㄠ',
  ne:'ㄋㄜ', nei:'ㄋㄟ', nen:'ㄋㄣ', neng:'ㄋㄥ', ni:'ㄋㄧ',
  nian:'ㄋㄧㄢ', niang:'ㄋㄧㄤ', niao:'ㄋㄧㄠ', nie:'ㄋㄧㄝ', nin:'ㄋㄧㄣ',
  ning:'ㄋㄧㄥ', niu:'ㄋㄧㄡ', nong:'ㄋㄨㄥ', nu:'ㄋㄨ', nü:'ㄋㄩ',
  nuan:'ㄋㄨㄢ', nüe:'ㄋㄩㄝ', nuo:'ㄋㄨㄛ',
  o:'ㄛ', ou:'ㄡ',
  pa:'ㄆㄚ', pai:'ㄆㄞ', pan:'ㄆㄢ', pang:'ㄆㄤ', pao:'ㄆㄠ',
  pei:'ㄆㄟ', pen:'ㄆㄣ', peng:'ㄆㄥ', pi:'ㄆㄧ', pian:'ㄆㄧㄢ',
  piao:'ㄆㄧㄠ', pie:'ㄆㄧㄝ', pin:'ㄆㄧㄣ', ping:'ㄆㄧㄥ', po:'ㄆㄛ',
  pou:'ㄆㄡ', pu:'ㄆㄨ',
  qi:'ㄑㄧ', qia:'ㄑㄧㄚ', qian:'ㄑㄧㄢ', qiang:'ㄑㄧㄤ', qiao:'ㄑㄧㄠ',
  qie:'ㄑㄧㄝ', qin:'ㄑㄧㄣ', qing:'ㄑㄧㄥ', qiong:'ㄑㄩㄥ', qiu:'ㄑㄧㄡ',
  qu:'ㄑㄩ', quan:'ㄑㄩㄢ', que:'ㄑㄩㄝ', qun:'ㄑㄩㄣ',
  ran:'ㄖㄢ', rang:'ㄖㄤ', rao:'ㄖㄠ', re:'ㄖㄜ', ren:'ㄖㄣ',
  reng:'ㄖㄥ', ri:'ㄖ', rong:'ㄖㄨㄥ', rou:'ㄖㄡ', ru:'ㄖㄨ',
  ruan:'ㄖㄨㄢ', rui:'ㄖㄨㄟ', run:'ㄖㄨㄣ', ruo:'ㄖㄨㄛ',
  sa:'ㄙㄚ', sai:'ㄙㄞ', san:'ㄙㄢ', sang:'ㄙㄤ', sao:'ㄙㄠ',
  se:'ㄙㄜ', sen:'ㄙㄣ', seng:'ㄙㄥ', sha:'ㄕㄚ', shai:'ㄕㄞ',
  shan:'ㄕㄢ', shang:'ㄕㄤ', shao:'ㄕㄠ', she:'ㄕㄜ', shei:'ㄕㄟ',
  shen:'ㄕㄣ', sheng:'ㄕㄥ', shi:'ㄕ', shou:'ㄕㄡ', shu:'ㄕㄨ',
  shua:'ㄕㄨㄚ', shuai:'ㄕㄨㄞ', shuan:'ㄕㄨㄢ', shuang:'ㄕㄨㄤ', shui:'ㄕㄨㄟ',
  shun:'ㄕㄨㄣ', shuo:'ㄕㄨㄛ', si:'ㄙ', song:'ㄙㄨㄥ', sou:'ㄙㄡ',
  su:'ㄙㄨ', suan:'ㄙㄨㄢ', sui:'ㄙㄨㄟ', sun:'ㄙㄨㄣ', suo:'ㄙㄨㄛ',
  ta:'ㄊㄚ', tai:'ㄊㄞ', tan:'ㄊㄢ', tang:'ㄊㄤ', tao:'ㄊㄠ',
  te:'ㄊㄜ', teng:'ㄊㄥ', ti:'ㄊㄧ', tian:'ㄊㄧㄢ', tiao:'ㄊㄧㄠ',
  tie:'ㄊㄧㄝ', ting:'ㄊㄧㄥ', tong:'ㄊㄨㄥ', tou:'ㄊㄡ', tu:'ㄊㄨ',
  tuan:'ㄊㄨㄢ', tui:'ㄊㄨㄟ', tun:'ㄊㄨㄣ', tuo:'ㄊㄨㄛ',
  wa:'ㄨㄚ', wai:'ㄨㄞ', wan:'ㄨㄢ', wang:'ㄨㄤ', wei:'ㄨㄟ',
  wen:'ㄨㄣ', weng:'ㄨㄥ', wo:'ㄨㄛ', wu:'ㄨ',
  xi:'ㄒㄧ', xia:'ㄒㄧㄚ', xian:'ㄒㄧㄢ', xiang:'ㄒㄧㄤ', xiao:'ㄒㄧㄠ',
  xie:'ㄒㄧㄝ', xin:'ㄒㄧㄣ', xing:'ㄒㄧㄥ', xiong:'ㄒㄩㄥ', xiu:'ㄒㄧㄡ',
  xu:'ㄒㄩ', xuan:'ㄒㄩㄢ', xue:'ㄒㄩㄝ', xun:'ㄒㄩㄣ',
  ya:'ㄧㄚ', yan:'ㄧㄢ', yang:'ㄧㄤ', yao:'ㄧㄠ', ye:'ㄧㄝ',
  yi:'ㄧ', yin:'ㄧㄣ', ying:'ㄧㄥ', yo:'ㄧㄛ', yong:'ㄩㄥ',
  you:'ㄧㄡ', yu:'ㄩ', yuan:'ㄩㄢ', yue:'ㄩㄝ', yun:'ㄩㄣ',
  za:'ㄗㄚ', zai:'ㄗㄞ', zan:'ㄗㄢ', zang:'ㄗㄤ', zao:'ㄗㄠ',
  ze:'ㄗㄜ', zei:'ㄗㄟ', zen:'ㄗㄣ', zeng:'ㄗㄥ', zha:'ㄓㄚ',
  zhai:'ㄓㄞ', zhan:'ㄓㄢ', zhang:'ㄓㄤ', zhao:'ㄓㄠ', zhe:'ㄓㄜ',
  zhei:'ㄓㄟ', zhen:'ㄓㄣ', zheng:'ㄓㄥ', zhi:'ㄓ', zhong:'ㄓㄨㄥ',
  zhou:'ㄓㄡ', zhu:'ㄓㄨ', zhua:'ㄓㄨㄚ', zhuai:'ㄓㄨㄞ', zhuan:'ㄓㄨㄢ',
  zhuang:'ㄓㄨㄤ', zhui:'ㄓㄨㄟ', zhun:'ㄓㄨㄣ', zhuo:'ㄓㄨㄛ', zi:'ㄗ',
  zong:'ㄗㄨㄥ', zou:'ㄗㄡ', zu:'ㄗㄨ', zuan:'ㄗㄨㄢ', zui:'ㄗㄨㄟ',
  zun:'ㄗㄨㄣ', zuo:'ㄗㄨㄛ',
};

// 1=high level (no mark in zhuyin), 2=ˊ, 3=ˇ, 4=ˋ, 0/5=neutral ˙
const ZHUYIN_TONE = ['', '', 'ˊ', 'ˇ', 'ˋ'];

// Format a single accented syllable into a target system.
// system: 'accented' | 'numbered' | 'zhuyin'
function formatSyllable(syl, tone, system) {
  if (!syl) return '';
  if (system === 'accented') return syl;
  const [plain] = _splitSyllable(syl);
  // Strip stray apostrophes that mark syllable boundaries (rán'ér).
  const clean = plain.replace(/['\u2019]/g, '');
  if (system === 'numbered') {
    return clean + (tone || 5);
  }
  if (system === 'zhuyin') {
    const base = ZHUYIN_MAP[clean] || ZHUYIN_MAP[clean.toLowerCase()] || clean;
    if (tone === 0) return '˙' + base; // neutral mark precedes in tradition
    return base + (ZHUYIN_TONE[tone] || '');
  }
  return syl;
}

// Format an entire word (array of syllables + tones) for display.
// Accented uses no separator (they read as one word); numbered/zhuyin use a
// thin space between syllables to avoid digit/diacritic ambiguity.
function formatPron(pyArr, tones, system) {
  if (!pyArr || !pyArr.length) return '';
  if (system === 'accented') {
    return pyArr.join('');
  }
  const parts = pyArr.map((s, i) => formatSyllable(s, tones[i] || 0, system));
  return parts.join(system === 'zhuyin' ? '\u2009' : ' ');
}

// Convenience for word objects ({pyArr, t}) and hanzi objects ({pyArr, t}).
function pronOf(obj, system) {
  if (!obj) return '';
  const arr = obj.pyArr || (obj.py ? [obj.py] : []);
  const tones = Array.isArray(obj.t) ? obj.t : [obj.t || 0];
  return formatPron(arr, tones, system);
}

Object.assign(window, {
  ZHUYIN_MAP, ZHUYIN_TONE, formatSyllable, formatPron, pronOf,
});
