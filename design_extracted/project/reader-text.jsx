// reader-text.jsx — Core reading components: Token, WordPopover, HanziTile.
// Pinyin is rendered through formatPron() so the same word renders as
// accented (yuèguāng), numbered (yue4 guang1), or zhuyin (ㄩㄝˋ ㄍㄨㄤ).
// Glosses pick word.gloss[lang] with English as fallback.

const { useState, useRef, useEffect, useLayoutEffect } = React;

// Tone color palette — dark and light variants.
const TONE = {
  dark: {
    1: 'oklch(0.78 0.13 25)',
    2: 'oklch(0.82 0.12 75)',
    3: 'oklch(0.80 0.13 145)',
    4: 'oklch(0.78 0.11 250)',
    0: 'oklch(0.65 0.005 60)',
  },
  light: {
    1: 'oklch(0.50 0.16 25)',
    2: 'oklch(0.55 0.14 75)',
    3: 'oklch(0.48 0.14 145)',
    4: 'oklch(0.48 0.13 250)',
    0: 'oklch(0.42 0.005 60)',
  },
};

const PY_FONT = '"IBM Plex Sans", system-ui, sans-serif';
const ZHU_FONT = '"Noto Sans TC", "Noto Serif SC", system-ui, sans-serif';

function Token({ word, idx, paraIdx, dark, ruby, pron, toneStyle, selected, onSelect, fontScale }) {
  if (word.punct) {
    return (
      <span
        style={{
          fontFamily: '"Noto Serif SC", serif',
          color: 'var(--text)',
          fontSize: `${1.5 * fontScale}rem`,
          padding: '0 1px',
        }}
      >
        {word.w}
      </span>
    );
  }

  const palette = dark ? TONE.dark : TONE.light;
  const chars = [...word.w];
  const tones = word.t.length === chars.length ? word.t : chars.map(() => word.t[0] || 0);
  const pronSys = pron || 'accented';
  const pyDisplay = formatPron(word.pyArr, tones, pronSys);
  const isZhuyin = pronSys === 'zhuyin';

  const colorChar = toneStyle === 'char' || toneStyle === 'both';
  const colorUnder = toneStyle === 'underline' || toneStyle === 'both';
  const colorPinyin = toneStyle === 'pinyin' || toneStyle === 'both';

  return (
    <span
      data-word-idx={`${paraIdx}.${idx}`}
      role="button"
      tabIndex={0}
      onClick={(e) => onSelect(paraIdx, idx, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(paraIdx, idx, e.currentTarget);
        }
      }}
      className={`token ${selected ? 'token--selected' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        fontFamily: '"Noto Serif SC", serif',
        fontSize: `${1.55 * fontScale}rem`,
        lineHeight: 2.2,
        padding: ruby ? (isZhuyin ? '1.7em 2px 4px' : '1.4em 2px 4px') : '2px 2px 4px',
        margin: '0 1px',
        borderRadius: 4,
        verticalAlign: 'baseline',
        background: selected ? 'var(--token-selected-bg)' : 'transparent',
        outline: 'none',
        transition: 'background .14s ease',
      }}
    >
      {ruby && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: isZhuyin ? '0.2em' : '0.3em',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: isZhuyin ? ZHU_FONT : PY_FONT,
            fontSize: `${(isZhuyin ? 0.72 : 0.65) * fontScale}rem`,
            fontWeight: 400,
            color: colorPinyin
              ? (tones.length === 1 ? palette[tones[0]] : 'var(--text-2)')
              : 'var(--text-2)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {pyDisplay}
        </span>
      )}
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            color: colorChar ? palette[tones[i] || 0] : 'var(--text)',
            borderBottom: colorUnder
              ? `2px solid ${palette[tones[i] || 0]}`
              : '2px solid transparent',
            paddingBottom: 1,
          }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

function Paragraph({ tokens, paraIdx, dark, ruby, pron, toneStyle, selectedKey, onSelect, fontScale }) {
  return (
    <p
      style={{
        margin: '0 0 1.4em',
        textAlign: 'justify',
        textJustify: 'inter-character',
        wordBreak: 'break-word',
      }}
    >
      {tokens.map((t, i) => (
        <Token
          key={i}
          word={t}
          idx={i}
          paraIdx={paraIdx}
          dark={dark}
          ruby={ruby}
          pron={pron}
          toneStyle={toneStyle}
          selected={selectedKey === `${paraIdx}.${i}`}
          onSelect={onSelect}
          fontScale={fontScale}
        />
      ))}
    </p>
  );
}

function WordPopover({ word, anchor, dark, pron, lang, onClose, onSave, saved, onAddCard }) {
  const [pos, setPos] = useState({ left: 0, top: 0, placement: 'below' });
  const [pickedHanzi, setPickedHanzi] = useState(null);
  const popRef = useRef(null);

  useLayoutEffect(() => {
    if (!anchor) return;
    const ar = anchor.getBoundingClientRect();
    const ph = popRef.current ? popRef.current.offsetHeight : 280;
    const pw = popRef.current ? popRef.current.offsetWidth : 360;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const placeBelow = ar.bottom + ph + 18 < vh;
    let left = ar.left + ar.width / 2 - pw / 2;
    left = Math.max(16, Math.min(vw - pw - 16, left));
    const top = placeBelow ? ar.bottom + 14 : ar.top - ph - 14;
    setPos({ left, top, placement: placeBelow ? 'below' : 'above' });
  }, [anchor, word]);

  if (!word || word.punct) return null;

  const palette = dark ? TONE.dark : TONE.light;
  const chars = [...word.w];
  const tones = word.t.length === chars.length ? word.t : chars.map(() => word.t[0] || 0);
  const isMulti = chars.length > 1;
  const pronSys = pron || 'accented';
  const langKey = lang || 'en';
  const pyDisplay = formatPron(word.pyArr, tones, pronSys);
  const glossText = (word.gloss && (word.gloss[langKey] || word.gloss.en)) || '';

  const tailLeft = anchor
    ? Math.max(20, Math.min(340, anchor.getBoundingClientRect().left + anchor.getBoundingClientRect().width / 2 - pos.left))
    : 24;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'transparent' }}
      />
      <div
        ref={popRef}
        role="dialog"
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          zIndex: 51,
          width: 360,
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: dark
            ? '0 24px 64px -16px rgba(0,0,0,.6), 0 2px 0 rgba(255,255,255,.02) inset'
            : '0 24px 64px -16px rgba(40,30,20,.18), 0 1px 0 rgba(255,255,255,.6) inset',
          overflow: 'hidden',
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: tailLeft - 6,
            [pos.placement === 'below' ? 'top' : 'bottom']: -6,
            width: 12, height: 12,
            background: 'var(--surface)',
            borderTop: pos.placement === 'below' ? '1px solid var(--border)' : 'none',
            borderLeft: pos.placement === 'below' ? '1px solid var(--border)' : 'none',
            borderBottom: pos.placement === 'above' ? '1px solid var(--border)' : 'none',
            borderRight: pos.placement === 'above' ? '1px solid var(--border)' : 'none',
            transform: 'rotate(45deg)',
          }}
        />

        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div
              style={{
                fontFamily: '"Noto Serif SC", serif',
                fontSize: 44,
                lineHeight: 1,
                letterSpacing: 1,
              }}
            >
              {chars.map((c, i) => (
                <span key={i} style={{ color: palette[tones[i] || 0] }}>{c}</span>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: pronSys === 'zhuyin' ? ZHU_FONT : PY_FONT,
                  fontSize: pronSys === 'zhuyin' ? 20 : 18,
                  letterSpacing: '0.01em',
                  color: 'var(--text)',
                }}
              >
                {pyDisplay}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {tones.map((t, i) => (
                  <ToneDot key={i} tone={t} color={palette[t || 0]} />
                ))}
              </div>
            </div>
            <button
              onClick={() => onSave(word)}
              title={saved ? 'Saved' : 'Save word'}
              style={iconBtn(dark, saved)}
            >
              {saved ? '★' : '☆'}
            </button>
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: 16,
              lineHeight: 1.45,
              color: 'var(--text)',
            }}
            lang={langKey}
          >
            {glossText}
          </div>
        </div>

        {isMulti && (
          <div style={{ padding: '12px 14px 10px' }}>
            <div
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-3)',
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              characters · tap to inspect
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {chars.map((c, i) => (
                <HanziTile
                  key={i}
                  char={c}
                  tone={tones[i] || 0}
                  syllable={(word.pyArr && word.pyArr[i]) || ''}
                  palette={palette}
                  active={pickedHanzi === c}
                  onClick={() => setPickedHanzi(pickedHanzi === c ? null : c)}
                  dark={dark}
                  pron={pronSys}
                />
              ))}
            </div>
            {pickedHanzi && HANZI[pickedHanzi] && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 12px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  fontFamily: '"Spectral", Georgia, serif',
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'var(--text)',
                }}
              >
                <span
                  style={{
                    fontFamily: '"Noto Serif SC", serif',
                    fontSize: 22,
                    color: palette[(Array.isArray(HANZI[pickedHanzi].t) ? HANZI[pickedHanzi].t[0] : HANZI[pickedHanzi].t) || 0],
                    marginRight: 8,
                  }}
                >
                  {pickedHanzi}
                </span>
                <span
                  style={{
                    fontFamily: pronSys === 'zhuyin' ? ZHU_FONT : PY_FONT,
                    color: 'var(--text-2)',
                  }}
                >
                  {pronOf(HANZI[pickedHanzi], pronSys)}
                </span>
                <span style={{ color: 'var(--text-3)', margin: '0 8px' }}>·</span>
                <span lang={langKey}>
                  {(HANZI[pickedHanzi].gloss && (HANZI[pickedHanzi].gloss[langKey] || HANZI[pickedHanzi].gloss.en)) || ''}
                </span>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 10px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <button style={popBtn(dark)} title="Play audio">
            <span style={{ marginRight: 6 }}>▶</span>say it
          </button>
          <button style={popBtn(dark)} onClick={() => onAddCard(word)} title="Add flashcard">
            <span style={{ marginRight: 6 }}>＋</span>card
          </button>
          <button style={popBtn(dark)} title="Open in dictionary">
            <span style={{ marginRight: 6 }}>↗</span>more
          </button>
          <span style={{ flex: 1 }} />
          <button onClick={onClose} title="Close" style={popBtnGhost(dark)}>esc</button>
        </div>
      </div>
    </>
  );
}

function HanziTile({ char, tone, syllable, palette, active, onClick, dark, pron }) {
  const pronSys = pron || 'accented';
  const sub = syllable
    ? formatSyllable(syllable, tone || 0, pronSys)
    : (HANZI[char] ? pronOf(HANZI[char], pronSys) : '·');
  return (
    <button
      onClick={onClick}
      style={{
        font: 'inherit',
        cursor: 'pointer',
        background: active ? 'var(--surface-2)' : 'transparent',
        border: `1px solid ${active ? palette[tone] : 'var(--border)'}`,
        borderRadius: 6,
        padding: '6px 10px 4px',
        textAlign: 'center',
        transition: 'all .14s ease',
        boxShadow: active ? `0 0 0 1px ${palette[tone]}` : 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"Noto Serif SC", serif',
          fontSize: 22,
          color: palette[tone],
          lineHeight: 1.1,
        }}
      >
        {char}
      </div>
      <div
        style={{
          fontFamily: pronSys === 'zhuyin' ? ZHU_FONT : PY_FONT,
          fontSize: pronSys === 'zhuyin' ? 12 : 11,
          color: 'var(--text-3)',
          marginTop: 2,
          letterSpacing: '0.02em',
        }}
      >
        {sub}
      </div>
    </button>
  );
}

function ToneDot({ tone, color }) {
  const path = {
    1: 'M 0 5 L 18 5',
    2: 'M 0 9 Q 9 9 18 1',
    3: 'M 0 3 Q 4 11 9 11 Q 14 11 18 3',
    4: 'M 0 1 L 18 9',
    0: 'M 0 5 L 18 5',
  }[tone || 0];
  return (
    <svg width="20" height="12" style={{ display: 'inline-block' }}>
      <path
        d={path}
        stroke={color}
        strokeWidth={tone === 0 ? 1.2 : 2}
        strokeOpacity={tone === 0 ? 0.5 : 1}
        strokeDasharray={tone === 0 ? '2 2' : 'none'}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function iconBtn(dark, on) {
  return {
    width: 32, height: 32,
    fontSize: 18,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: on ? 'var(--accent-soft)' : 'transparent',
    color: on ? 'var(--accent)' : 'var(--text-2)',
    cursor: 'pointer',
    transition: 'all .14s',
    fontFamily: 'inherit',
  };
}
function popBtn(dark) {
  return {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize: 13,
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'all .14s',
  };
}
function popBtnGhost(dark) {
  return {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize: 12,
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 6,
    color: 'var(--text-3)',
    cursor: 'pointer',
    letterSpacing: '0.04em',
  };
}

Object.assign(window, {
  TONE, PY_FONT, ZHU_FONT, Token, Paragraph, WordPopover, HanziTile, ToneDot,
  iconBtn, popBtn, popBtnGhost,
});
