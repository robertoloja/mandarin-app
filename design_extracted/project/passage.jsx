// Lu Xun · 狂人日记 (Diary of a Madman) Chapter I — segmented data.
// Token shape: { w, pyArr[], t[], gloss:{en,de}, punct? }
// pyArr is the source of truth for pronunciation; reader components convert
// it to numbered pinyin or zhuyin via pronunciation.jsx helpers.

const PASSAGE_TITLE = '狂人日记';
const PASSAGE_TITLE_PY = ['Kuáng', 'rén', 'Rì', 'jì'];
const PASSAGE_TITLE_TONES = [2, 2, 4, 4];
const PASSAGE_TITLE_EN = 'Diary of a Madman';
const PASSAGE_TITLE_DE = 'Tagebuch eines Verrückten';
const PASSAGE_AUTHOR_EN = 'Lu Xun · 1918';
const PASSAGE_AUTHOR_DE = 'Lu Xun · 1918';
const CHAPTER = { idx: 1, of: 13, label: 'Chapter 1' };

const P = (...words) => words;
// Word factory: w(hanzi, pyArr, tones, gloss_en, gloss_de)
const w = (w, pyArr, t, en, de) => ({
  w,
  pyArr: Array.isArray(pyArr) ? pyArr : [pyArr],
  t: Array.isArray(t) ? t : [t],
  gloss: { en, de },
});
const punct = (s) => ({ w: s, pyArr: [], t: [0], gloss: { en: '', de: '' }, punct: true });

const PARAGRAPHS = [
  P(
    w('今天', ['jīn', 'tiān'], [1, 1], 'today', 'heute'),
    w('晚上', ['wǎn', 'shang'], [3, 0], 'evening, night', 'Abend, Nacht'),
    punct('，'),
    w('很', ['hěn'], [3], 'very', 'sehr'),
    w('好', ['hǎo'], [3], 'good, fine', 'gut, schön'),
    w('的', ['de'], [0], '(possessive particle)', '(Genitivpartikel)'),
    w('月光', ['yuè', 'guāng'], [4, 1], 'moonlight', 'Mondlicht'),
    punct('。')
  ),
  P(
    w('我', ['wǒ'], [3], 'I, me', 'ich, mich'),
    w('不', ['bù'], [4], 'not', 'nicht'),
    w('见', ['jiàn'], [4], 'to see', 'sehen'),
    w('他', ['tā'], [1], 'it / him', 'es / ihn'),
    punct('，'),
    w('已', ['yǐ'], [3], 'already', 'bereits, schon'),
    w('是', ['shì'], [4], 'to be', 'sein, ist'),
    w('三十', ['sān', 'shí'], [1, 2], 'thirty', 'dreißig'),
    w('多', ['duō'], [1], 'more, over', 'mehr, über'),
    w('年', ['nián'], [2], 'year', 'Jahr'),
    punct('；'),
    w('今天', ['jīn', 'tiān'], [1, 1], 'today', 'heute'),
    w('见', ['jiàn'], [4], 'to see', 'sehen'),
    w('了', ['le'], [0], '(aspect particle)', '(Aspektpartikel)'),
    punct('，'),
    w('精神', ['jīng', 'shén'], [1, 2], 'spirit, vigor', 'Geist, Vitalität'),
    w('分外', ['fèn', 'wài'], [4, 4], 'especially, exceptionally', 'besonders, außergewöhnlich'),
    w('爽快', ['shuǎng', 'kuài'], [3, 4], 'refreshed, clear-headed', 'erfrischt, klar'),
    punct('。'),
    w('才', ['cái'], [2], 'only then', 'erst dann'),
    w('知道', ['zhī', 'dào'], [1, 4], 'to know, to realize', 'wissen, erkennen'),
    w('以前', ['yǐ', 'qián'], [3, 2], 'before, previously', 'früher, vorher'),
    w('的', ['de'], [0], '(possessive)', '(Genitivpartikel)'),
    w('三十', ['sān', 'shí'], [1, 2], 'thirty', 'dreißig'),
    w('多', ['duō'], [1], 'more', 'mehr'),
    w('年', ['nián'], [2], 'year', 'Jahr'),
    punct('，'),
    w('全', ['quán'], [2], 'all, entire', 'ganz, völlig'),
    w('是', ['shì'], [4], 'to be', 'sein, ist'),
    w('发昏', ['fā', 'hūn'], [1, 1], 'to be dazed, in a fog', 'benommen, im Nebel'),
    punct('；'),
    w('然而', ['rán', 'ér'], [2, 2], 'however, yet', 'jedoch, aber'),
    w('须', ['xū'], [1], 'must', 'muss'),
    w('十分', ['shí', 'fēn'], [2, 1], 'extremely, very', 'äußerst, sehr'),
    w('小心', ['xiǎo', 'xīn'], [3, 1], 'careful', 'vorsichtig'),
    punct('。')
  ),
  P(
    w('不然', ['bù', 'rán'], [4, 2], 'otherwise', 'sonst, andernfalls'),
    punct('，'),
    w('那', ['nà'], [4], 'that', 'jene(r/s)'),
    w('赵', ['Zhào'], [4], 'Zhao (surname)', 'Zhao (Familienname)'),
    w('家', ['jiā'], [1], 'family, household', 'Familie, Haushalt'),
    w('的', ['de'], [0], '(possessive)', '(Genitivpartikel)'),
    w('狗', ['gǒu'], [3], 'dog', 'Hund'),
    punct('，'),
    w('何以', ['hé', 'yǐ'], [2, 3], 'how, why', 'warum, weshalb'),
    w('看', ['kàn'], [4], 'to look at', 'ansehen, anblicken'),
    w('我', ['wǒ'], [3], 'I, me', 'mich'),
    w('两', ['liǎng'], [3], 'two', 'zwei'),
    w('眼', ['yǎn'], [3], 'eye, glance', 'Auge, Blick'),
    w('呢', ['ne'], [0], '(question particle)', '(Fragepartikel)'),
    punct('？')
  ),
  P(
    w('我', ['wǒ'], [3], 'I', 'ich'),
    w('怕', ['pà'], [4], 'to fear', 'fürchten'),
    w('得', ['de'], [0], '(structural particle)', '(Strukturpartikel)'),
    w('有理', ['yǒu', 'lǐ'], [3, 3], 'reasonable, justified', 'begründet, mit gutem Grund'),
    punct('。')
  ),
];

const TRANSLATIONS = {
  en: [
    'Tonight, what fine moonlight.',
    'I haven\u2019t seen it for over thirty years; tonight, seeing it again, my spirit feels exceptionally refreshed. Only now do I realize that for thirty-odd years I\u2019ve been living in a fog \u2014 still, I must be extremely careful.',
    'Otherwise, why has that Zhao family\u2019s dog given me two looks?',
    'My fear has its reasons.',
  ],
  de: [
    'Heute Abend, was für ein schönes Mondlicht.',
    'Ich habe es seit mehr als dreißig Jahren nicht gesehen; da ich es heute wiedersehe, fühlt sich mein Geist außergewöhnlich erfrischt. Erst jetzt erkenne ich, dass ich seit dreißig und mehr Jahren wie im Nebel gelebt habe \u2014 dennoch muss ich äußerst vorsichtig sein.',
    'Andernfalls, weshalb hat mich der Hund jener Familie Zhao zweimal angesehen?',
    'Meine Furcht hat ihren guten Grund.',
  ],
};

// Title translations available per-language for chrome.
const TITLE_LABEL = { en: 'Diary of a Madman', de: 'Tagebuch eines Verrückten' };

// Per-hanzi map (only chars appearing in multi-char words; single-char words
// already display their full info from the word data).
const _h = (pyArr, t, en, de) => ({ pyArr, t, gloss: { en, de } });
const HANZI = {
  '今': _h(['jīn'], [1], 'now, today', 'jetzt, heute'),
  '天': _h(['tiān'], [1], 'sky, day, heaven', 'Himmel, Tag'),
  '晚': _h(['wǎn'], [3], 'evening, late', 'Abend, spät'),
  '上': _h(['shàng'], [4], 'up, on, above', 'oben, auf'),
  '月': _h(['yuè'], [4], 'moon, month', 'Mond, Monat'),
  '光': _h(['guāng'], [1], 'light, glory', 'Licht, Glanz'),
  '三': _h(['sān'], [1], 'three', 'drei'),
  '十': _h(['shí'], [2], 'ten', 'zehn'),
  '精': _h(['jīng'], [1], 'essence, spirit', 'Wesen, Geist'),
  '神': _h(['shén'], [2], 'spirit, god', 'Geist, Gott'),
  '分': _h(['fēn'], [1], 'divide; minute', 'teilen; Minute'),
  '外': _h(['wài'], [4], 'outside, beyond', 'draußen, jenseits'),
  '爽': _h(['shuǎng'], [3], 'bright, clear, refreshing', 'klar, erfrischend'),
  '快': _h(['kuài'], [4], 'fast, pleasant', 'schnell, angenehm'),
  '知': _h(['zhī'], [1], 'to know', 'wissen'),
  '道': _h(['dào'], [4], 'way, path; to say', 'Weg; sagen'),
  '以': _h(['yǐ'], [3], 'with, by means of', 'mit, mittels'),
  '前': _h(['qián'], [2], 'before, in front of', 'vor, davor'),
  '发': _h(['fā'], [1], 'to emit, issue', 'aussenden, ausgeben'),
  '昏': _h(['hūn'], [1], 'dim, dazed, dusk', 'düster, benommen'),
  '然': _h(['rán'], [2], 'thus, so', 'so, dann'),
  '而': _h(['ér'], [2], 'and, but', 'und, aber'),
  '小': _h(['xiǎo'], [3], 'small', 'klein'),
  '心': _h(['xīn'], [1], 'heart, mind', 'Herz, Geist'),
  '不': _h(['bù'], [4], 'not', 'nicht'),
  '何': _h(['hé'], [2], 'what, how, why', 'was, wie, warum'),
  '有': _h(['yǒu'], [3], 'to have', 'haben'),
  '理': _h(['lǐ'], [3], 'reason, principle', 'Grund, Prinzip'),
};

// Chapter outline (mock; content beyond ch.1 is placeholder).
const CHAPTERS = [
  { n: 1, title: 'I.', preview: '今天晚上，很好的月光\u2026', read: false, current: true },
  { n: 2, title: 'II.', preview: '今天全没月光\u2026', read: false },
  { n: 3, title: 'III.', preview: '晚上总是睡不着\u2026', read: false },
  { n: 4, title: 'IV.', preview: '早上，我静坐了一会\u2026', read: false },
  { n: 5, title: 'V.', preview: '这几天是退一步想\u2026', read: false },
  { n: 6, title: 'VI.', preview: '黑漆漆的，不知是日是夜\u2026', read: false },
  { n: 7, title: 'VII.', preview: '我晓得他们的方法\u2026', read: false },
  { n: 8, title: 'VIII.', preview: '其实我岂不知道\u2026', read: false },
  { n: 9, title: 'IX.', preview: '自己想吃人，又怕被别人吃了\u2026', read: false },
  { n: 10, title: 'X.', preview: '大哥，我有话告诉你\u2026', read: false },
  { n: 11, title: 'XI.', preview: '太阳也不出，门也不开\u2026', read: false },
  { n: 12, title: 'XII.', preview: '不能想了\u2026', read: false },
  { n: 13, title: 'XIII.', preview: '没有吃过人的孩子，或者还有？救救孩子\u2026', read: false },
];

// Saved words (mock seed list)
const SAVED = [
  { w: '月光', pyArr: ['yuè', 'guāng'], t: [4, 1], gloss: { en: 'moonlight', de: 'Mondlicht' } },
  { w: '分外', pyArr: ['fèn', 'wài'], t: [4, 4], gloss: { en: 'especially', de: 'besonders' } },
  { w: '爽快', pyArr: ['shuǎng', 'kuài'], t: [3, 4], gloss: { en: 'refreshed', de: 'erfrischt' } },
  { w: '发昏', pyArr: ['fā', 'hūn'], t: [1, 1], gloss: { en: 'in a daze', de: 'benommen' } },
  { w: '然而', pyArr: ['rán', 'ér'], t: [2, 2], gloss: { en: 'however', de: 'jedoch' } },
];

Object.assign(window, {
  PASSAGE_TITLE, PASSAGE_TITLE_PY, PASSAGE_TITLE_TONES,
  PASSAGE_TITLE_EN, PASSAGE_TITLE_DE,
  PASSAGE_AUTHOR_EN, PASSAGE_AUTHOR_DE,
  CHAPTER, PARAGRAPHS, TRANSLATIONS, TITLE_LABEL, HANZI, CHAPTERS, SAVED,
});
