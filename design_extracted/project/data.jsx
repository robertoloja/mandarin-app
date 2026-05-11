// Shared data + primitives for all wireframe variations
// (Mandarin sample text, tone colors, Word/Hanzi components)

const TONE_BG = {
  1: 'oklch(0.93 0.06 25)',     // light red
  2: 'oklch(0.93 0.08 75)',     // light amber/yellow
  3: 'oklch(0.93 0.07 145)',    // light green
  4: 'oklch(0.92 0.06 250)',    // light blue
  0: 'oklch(0.94 0.005 90)',    // neutral gray
};
const TONE_BG_DARK = {
  1: 'oklch(0.36 0.08 25)',
  2: 'oklch(0.36 0.10 75)',
  3: 'oklch(0.36 0.09 145)',
  4: 'oklch(0.36 0.08 250)',
  0: 'oklch(0.30 0.005 90)',
};
const TONE_FG = {
  1: 'oklch(0.45 0.16 25)',
  2: 'oklch(0.50 0.14 75)',
  3: 'oklch(0.45 0.14 145)',
  4: 'oklch(0.45 0.13 250)',
  0: 'oklch(0.55 0.005 90)',
};

// Sample passage — segmented words. Each word: hanzi, pinyin, tones array, gloss
const SAMPLE = [
  { w: '我', py: 'wǒ', t: [3], gloss: 'I, me' },
  { w: '今天', py: 'jīntiān', t: [1, 1], gloss: 'today' },
  { w: '去', py: 'qù', t: [4], gloss: 'to go' },
  { w: '图书馆', py: 'túshūguǎn', t: [2, 1, 3], gloss: 'library' },
  { w: '借', py: 'jiè', t: [4], gloss: 'to borrow' },
  { w: '了', py: 'le', t: [0], gloss: '(aspect particle)' },
  { w: '一本', py: 'yī běn', t: [1, 3], gloss: 'one (volume)' },
  { w: '关于', py: 'guānyú', t: [1, 2], gloss: 'about, regarding' },
  { w: '中国', py: 'zhōngguó', t: [1, 2], gloss: 'China' },
  { w: '历史', py: 'lìshǐ', t: [4, 3], gloss: 'history' },
  { w: '的', py: 'de', t: [0], gloss: '(possessive)' },
  { w: '书', py: 'shū', t: [1], gloss: 'book' },
  { w: '。', py: '', t: [0], gloss: '', punct: true },
];

const SAMPLE_2 = [
  { w: '他', py: 'tā', t: [1], gloss: 'he' },
  { w: '说', py: 'shuō', t: [1], gloss: 'to say' },
  { w: '学习', py: 'xuéxí', t: [2, 2], gloss: 'to study' },
  { w: '中文', py: 'zhōngwén', t: [1, 2], gloss: 'Chinese (language)' },
  { w: '需要', py: 'xūyào', t: [1, 4], gloss: 'to need' },
  { w: '耐心', py: 'nàixīn', t: [4, 1], gloss: 'patience' },
  { w: '。', py: '', t: [0], gloss: '', punct: true },
];

const TRANSLATION_1 = 'Today I went to the library and borrowed a book about Chinese history.';
const TRANSLATION_2 = 'He said studying Chinese requires patience.';

// Per-hanzi data for the "drill in" feature on multi-char words
const HANZI = {
  '今': { py: 'jīn', t: 1, gloss: 'now, present' },
  '天': { py: 'tiān', t: 1, gloss: 'sky, day' },
  '图': { py: 'tú', t: 2, gloss: 'picture, chart' },
  '书': { py: 'shū', t: 1, gloss: 'book, document' },
  '馆': { py: 'guǎn', t: 3, gloss: 'building, hall' },
  '一': { py: 'yī', t: 1, gloss: 'one' },
  '本': { py: 'běn', t: 3, gloss: 'volume, root' },
  '关': { py: 'guān', t: 1, gloss: 'shut, relate' },
  '于': { py: 'yú', t: 2, gloss: 'in, at, to' },
  '中': { py: 'zhōng', t: 1, gloss: 'middle, center' },
  '国': { py: 'guó', t: 2, gloss: 'country' },
  '历': { py: 'lì', t: 4, gloss: 'pass through' },
  '史': { py: 'shǐ', t: 3, gloss: 'history' },
  '学': { py: 'xué', t: 2, gloss: 'to learn' },
  '习': { py: 'xí', t: 2, gloss: 'to practice' },
  '中': { py: 'zhōng', t: 1, gloss: 'middle, center' },
  '文': { py: 'wén', t: 2, gloss: 'language, writing' },
  '需': { py: 'xū', t: 1, gloss: 'need, require' },
  '要': { py: 'yào', t: 4, gloss: 'want, need' },
  '耐': { py: 'nài', t: 4, gloss: 'endure' },
  '心': { py: 'xīn', t: 1, gloss: 'heart, mind' },
};

// Sketchy tone-tinted "chip" for a word
function ToneWord({ word, onClick, selected, ruby, dark, showTones = true, size = 'md' }) {
  if (word.punct) {
    return <span style={{ fontSize: size === 'lg' ? 28 : 20, padding: '0 2px' }}>{word.w}</span>;
  }
  const bgMap = dark ? TONE_BG_DARK : TONE_BG;
  // For multi-char words, build a horizontal stripe of per-char tone colors
  const chars = [...word.w];
  const tones = word.t.length === chars.length ? word.t : chars.map(() => word.t[0] || 0);
  const bg = showTones
    ? `linear-gradient(to right, ${chars
        .map((_, i) => {
          const start = (i / chars.length) * 100;
          const end = ((i + 1) / chars.length) * 100;
          const c = bgMap[tones[i] || 0];
          return `${c} ${start}%, ${c} ${end}%`;
        })
        .join(', ')})`
    : 'transparent';

  const fontSize = size === 'lg' ? 30 : size === 'sm' ? 18 : 24;
  return (
    <span
      onClick={onClick}
      data-word={word.w}
      style={{
        display: 'inline-block',
        verticalAlign: 'baseline',
        position: 'relative',
        cursor: 'pointer',
        background: bg,
        padding: ruby ? '14px 4px 4px' : '2px 5px',
        margin: '2px 1px',
        borderRadius: 4,
        border: selected ? '2px dashed currentColor' : '1.5px solid transparent',
        boxShadow: selected ? '2px 2px 0 currentColor' : 'none',
        fontFamily: '"Noto Serif SC", serif',
        fontSize,
        lineHeight: 1.3,
        color: dark ? '#e8e4dc' : '#1f1b15',
      }}
    >
      {ruby && (
        <span
          style={{
            position: 'absolute',
            top: -2,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: '"Patrick Hand", cursive',
            fontSize: Math.round(fontSize * 0.5),
            color: dark ? '#b8b1a3' : '#5a5247',
            letterSpacing: '0.02em',
          }}
        >
          {word.py}
        </span>
      )}
      {word.w}
    </span>
  );
}

// Sketchy "card" wrapper: charcoal border + offset shadow
function SketchCard({ children, style, dark, padding = 16, dashed = false, ...rest }) {
  return (
    <div
      style={{
        background: dark ? '#1f1b15' : '#fdfbf6',
        border: `${dashed ? '1.5px dashed' : '2px solid'} ${dark ? '#e8e4dc' : '#1f1b15'}`,
        borderRadius: 6,
        boxShadow: `3px 3px 0 ${dark ? '#e8e4dc' : '#1f1b15'}`,
        padding,
        color: dark ? '#e8e4dc' : '#1f1b15',
        fontFamily: '"Patrick Hand", cursive',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// Lightweight pill button
function SketchBtn({ children, active, dark, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        font: 'inherit',
        fontFamily: '"Patrick Hand", cursive',
        fontSize: 16,
        padding: '4px 12px',
        background: active ? (dark ? '#e8e4dc' : '#1f1b15') : 'transparent',
        color: active ? (dark ? '#1f1b15' : '#fdfbf6') : 'inherit',
        border: `1.5px solid ${dark ? '#e8e4dc' : '#1f1b15'}`,
        borderRadius: 999,
        cursor: 'pointer',
        boxShadow: active ? 'none' : `2px 2px 0 ${dark ? '#e8e4dc' : '#1f1b15'}`,
        transform: active ? 'translate(2px,2px)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// A scribble line — used as placeholder for "more text here"
function Scribble({ width = 60, dark, dashed = false }) {
  const stroke = dark ? '#b8b1a3' : '#7a7264';
  return (
    <svg width={width} height={8} style={{ verticalAlign: 'middle' }}>
      <path
        d={`M 2 4 Q ${width * 0.25} 1 ${width * 0.5} 4 T ${width - 2} 4`}
        stroke={stroke}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray={dashed ? '3 3' : 'none'}
      />
    </svg>
  );
}

// Detail content shown in popover/sheet/panel — pinyin, gloss, per-hanzi list
function WordDetail({ word, dark, compact, onHanziClick }) {
  if (!word || word.punct) return null;
  const chars = [...word.w];
  const showHanzi = chars.length > 1;
  return (
    <div style={{ fontFamily: '"Patrick Hand", cursive', color: dark ? '#e8e4dc' : '#1f1b15' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: '"Noto Serif SC", serif', fontSize: compact ? 28 : 36 }}>{word.w}</span>
        <span style={{ fontSize: compact ? 16 : 20, color: dark ? '#b8b1a3' : '#5a5247' }}>{word.py}</span>
      </div>
      <div style={{ fontSize: compact ? 14 : 17, marginBottom: showHanzi ? 10 : 0 }}>
        <span style={{ color: dark ? '#b8b1a3' : '#5a5247' }}>def. </span>
        {word.gloss}
      </div>
      {showHanzi && (
        <div>
          <div
            style={{
              fontSize: 13,
              color: dark ? '#b8b1a3' : '#5a5247',
              borderTop: `1px dashed ${dark ? '#5a5247' : '#b8b1a3'}`,
              paddingTop: 8,
              marginBottom: 6,
            }}
          >
            ↓ tap a hanzi
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chars.map((c, i) => {
              const h = HANZI[c] || { py: '?', t: 0, gloss: '—' };
              const bg = (dark ? TONE_BG_DARK : TONE_BG)[h.t];
              return (
                <button
                  key={i}
                  onClick={() => onHanziClick && onHanziClick(c)}
                  style={{
                    font: 'inherit',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    background: bg,
                    border: `1.5px solid ${dark ? '#e8e4dc' : '#1f1b15'}`,
                    borderRadius: 4,
                    padding: '4px 8px',
                    textAlign: 'left',
                    color: 'inherit',
                    minWidth: 80,
                  }}
                >
                  <div style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 22 }}>{c}</div>
                  <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#5a5247' }}>{h.py}</div>
                  <div style={{ fontSize: 12 }}>{h.gloss}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  TONE_BG, TONE_BG_DARK, TONE_FG,
  SAMPLE, SAMPLE_2, TRANSLATION_1, TRANSLATION_2, HANZI,
  ToneWord, SketchCard, SketchBtn, Scribble, WordDetail,
});
