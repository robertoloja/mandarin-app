// reader-app.jsx — Top-level layout: TopBar, Sidebar, Reader, BottomBar.
// Owns selection state, theme variables, layout mode, and ruby/translation
// toggles. Imports Token/Paragraph/WordPopover from reader-text.jsx and data
// from passage.jsx.

const { useState: useS, useEffect: useE, useRef: useR, useMemo } = React;

// ---------------- Theme tokens ----------------
const THEMES = {
  dark: {
    '--bg': 'oklch(0.18 0.01 60)',
    '--bg-2': 'oklch(0.16 0.01 60)',
    '--surface': 'oklch(0.23 0.012 60)',
    '--surface-2': 'oklch(0.27 0.012 60)',
    '--text': 'oklch(0.95 0.005 70)',
    '--text-2': 'oklch(0.78 0.008 70)',
    '--text-3': 'oklch(0.58 0.008 70)',
    '--border': 'oklch(0.32 0.012 60)',
    '--border-soft': 'oklch(0.26 0.012 60)',
    '--accent': 'oklch(0.82 0.13 70)',
    '--accent-soft': 'oklch(0.30 0.06 70)',
    '--token-selected-bg': 'oklch(0.28 0.04 70)',
    '--token-hover-bg': 'oklch(0.24 0.015 70)',
  },
  light: {
    '--bg': 'oklch(0.97 0.006 70)',
    '--bg-2': 'oklch(0.94 0.008 70)',
    '--surface': 'oklch(0.99 0.003 70)',
    '--surface-2': 'oklch(0.95 0.006 70)',
    '--text': 'oklch(0.20 0.008 60)',
    '--text-2': 'oklch(0.42 0.008 60)',
    '--text-3': 'oklch(0.58 0.006 60)',
    '--border': 'oklch(0.86 0.008 60)',
    '--border-soft': 'oklch(0.92 0.005 60)',
    '--accent': 'oklch(0.55 0.15 60)',
    '--accent-soft': 'oklch(0.93 0.05 70)',
    '--token-selected-bg': 'oklch(0.93 0.05 70)',
    '--token-hover-bg': 'oklch(0.95 0.01 70)',
  },
  sepia: {
    '--bg': 'oklch(0.92 0.025 80)',
    '--bg-2': 'oklch(0.88 0.03 80)',
    '--surface': 'oklch(0.96 0.018 80)',
    '--surface-2': 'oklch(0.90 0.025 80)',
    '--text': 'oklch(0.28 0.02 50)',
    '--text-2': 'oklch(0.46 0.018 50)',
    '--text-3': 'oklch(0.60 0.015 50)',
    '--border': 'oklch(0.78 0.025 65)',
    '--border-soft': 'oklch(0.84 0.022 65)',
    '--accent': 'oklch(0.50 0.13 40)',
    '--accent-soft': 'oklch(0.86 0.05 70)',
    '--token-selected-bg': 'oklch(0.86 0.06 70)',
    '--token-hover-bg': 'oklch(0.90 0.02 70)',
  },
};

// ---------------- Top Bar ----------------
function TopBar({ ruby, setRuby, translation, setTranslation, theme, setTheme, fontScale, setFontScale, onToggleSidebar, onToggleSaved, layout, setLayout }) {
  return (
    <header
      style={{
        gridArea: 'top',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 22px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'relative',
        zIndex: 5,
      }}
    >
      <button onClick={onToggleSidebar} title="Library" style={chromeIconBtn()}>
        <ListIcon />
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        }}
      >
        <span style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 16, color: 'var(--text)' }}>
          狂人日记
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>·</span>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontStyle: 'italic', fontFamily: '"Spectral", Georgia, serif' }}>
          Diary of a Madman
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>·</span>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Lu Xun</span>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>·</span>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>I / 13</span>
      </div>

      <span style={{ flex: 1 }} />

      <SegControl
        items={[
          { v: 'flow', label: 'Flow' },
          { v: 'interlinear', label: 'Interlinear' },
          { v: 'grid', label: 'Vocab grid' },
        ]}
        value={layout}
        onChange={setLayout}
      />

      <div style={{ width: 1, height: 22, background: 'var(--border)' }} />

      <ChromeBtn
        on={ruby}
        onClick={() => setRuby(!ruby)}
        label="Pinyin"
        title="Toggle ruby pinyin annotations above each word"
      />
      <ChromeBtn
        on={translation}
        onClick={() => setTranslation(!translation)}
        label="EN"
        title="Toggle English translation"
      />

      <div style={{ width: 1, height: 22, background: 'var(--border)' }} />

      <FontSizeControl value={fontScale} onChange={setFontScale} />
      <ThemeControl value={theme} onChange={setTheme} />

      <div style={{ width: 1, height: 22, background: 'var(--border)' }} />

      <button onClick={onToggleSaved} title="Saved words" style={chromeIconBtn()}>
        <BookmarkIcon />
      </button>
    </header>
  );
}

// ---------------- Sidebar ----------------
function Sidebar({ open, currentChapter, onClose }) {
  return (
    <aside
      style={{
        gridArea: 'side',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--text-3)',
            marginBottom: 6,
          }}
        >
          Reading
        </div>
        <div
          style={{
            fontFamily: '"Spectral", Georgia, serif',
            fontSize: 19,
            fontWeight: 500,
            color: 'var(--text)',
            lineHeight: 1.2,
          }}
        >
          Diary of a Madman
        </div>
        <div
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 15,
            color: 'var(--text-2)',
            marginTop: 4,
          }}
        >
          狂人日记
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            marginTop: 8,
          }}
        >
          鲁迅 · 1918 · short story
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ProgressBar value={1 / 13} />
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>1 / 13</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--text-3)',
            padding: '10px 16px 6px',
          }}
        >
          Chapters
        </div>
        {CHAPTERS.map((c) => (
          <button
            key={c.n}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              background: c.current ? 'var(--surface-2)' : 'transparent',
              border: 'none',
              borderLeft: `2px solid ${c.current ? 'var(--accent)' : 'transparent'}`,
              color: c.current ? 'var(--text)' : 'var(--text-2)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              borderRadius: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                fontSize: 13,
                fontWeight: c.current ? 600 : 400,
              }}
            >
              <span style={{ width: 22, color: 'var(--text-3)', fontFeatureSettings: '"tnum"' }}>
                {c.title}
              </span>
              <span
                style={{
                  fontFamily: '"Noto Serif SC", serif',
                  fontSize: 13,
                  color: c.current ? 'var(--text)' : 'var(--text-2)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}
              >
                {c.preview}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-soft)',
          fontSize: 12,
          color: 'var(--text-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span>＋</span>
        <span>Paste new text</span>
      </div>
    </aside>
  );
}

// ---------------- Saved Words rail ----------------
function SavedRail({ open, savedWords, dark, onPick }) {
  if (!open) return null;
  return (
    <aside
      style={{
        gridArea: 'rail',
        background: 'var(--bg-2)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--text-3)',
          }}
        >
          Saved · {savedWords.length}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
          export ↗
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {savedWords.map((w, i) => (
          <button
            key={i}
            onClick={() => onPick && onPick(w)}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              width: '100%',
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-soft)',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span
              style={{
                fontFamily: '"Noto Serif SC", serif',
                fontSize: 22,
                color: 'var(--text)',
                minWidth: 50,
              }}
            >
              {w.w}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{w.py}</div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-3)',
                  fontFamily: '"Spectral", Georgia, serif',
                  fontStyle: 'italic',
                }}
              >
                {w.gloss}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-soft)' }}>
        <button
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: 6,
            fontFamily: 'inherit',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ＋ Add to flashcard deck
        </button>
      </div>
    </aside>
  );
}

// ---------------- Bottom Bar ----------------
function BottomBar({ paragraphIdx, totalParas }) {
  return (
    <footer
      style={{
        gridArea: 'bot',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 22px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: 13,
        color: 'var(--text-2)',
      }}
    >
      <button style={chromeBtn()}>← prev chapter</button>
      <span style={{ flex: 1, textAlign: 'center', color: 'var(--text-3)' }}>
        Chapter I · paragraph {paragraphIdx + 1} of {totalParas} · ~2 min
      </span>
      <button style={chromeBtn()}>next chapter →</button>
    </footer>
  );
}

// ---------------- Reader (3 layouts) ----------------
function Reader({ layout, ruby, translation, dark, toneStyle, fontScale, selectedKey, onSelect, paragraphIdx, setParagraphIdx }) {
  return (
    <main
      style={{
        gridArea: 'main',
        overflowY: 'auto',
        background: 'var(--bg)',
        padding: '0',
      }}
    >
      <article
        style={{
          maxWidth: layout === 'grid' ? 1100 : 760,
          margin: '0 auto',
          padding: '40px 32px 80px',
          color: 'var(--text)',
          fontFamily: '"Noto Serif SC", serif',
        }}
      >
        {/* Title block */}
        <header style={{ marginBottom: 28, fontFamily: '"Spectral", Georgia, serif' }}>
          <div
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'var(--text-3)',
              fontFamily: '"IBM Plex Sans", sans-serif',
              marginBottom: 10,
            }}
          >
            Chapter I  ·  狂人日记
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'var(--text)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            Tonight, what fine moonlight.
          </h1>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: 'var(--text-3)',
              fontFamily: '"IBM Plex Sans", sans-serif',
            }}
          >
            Lu Xun · published 1918 · {PARAGRAPHS.length} paragraphs
          </div>
        </header>

        {layout === 'flow' && (
          <FlowLayout
            ruby={ruby}
            translation={translation}
            dark={dark}
            toneStyle={toneStyle}
            fontScale={fontScale}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        )}

        {layout === 'interlinear' && (
          <InterlinearLayout
            ruby={ruby}
            dark={dark}
            toneStyle={toneStyle}
            fontScale={fontScale}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        )}

        {layout === 'grid' && (
          <GridLayout
            translation={translation}
            dark={dark}
            toneStyle={toneStyle}
            fontScale={fontScale}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        )}

        {/* End mark */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 36,
            color: 'var(--text-3)',
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: 13,
            letterSpacing: '0.3em',
          }}
        >
          · · ·
        </div>
      </article>
    </main>
  );
}

function FlowLayout({ ruby, translation, dark, toneStyle, fontScale, selectedKey, onSelect }) {
  return (
    <div>
      {PARAGRAPHS.map((tokens, p) => (
        <div key={p}>
          <Paragraph
            tokens={tokens}
            paraIdx={p}
            dark={dark}
            ruby={ruby}
            toneStyle={toneStyle}
            selectedKey={selectedKey}
            onSelect={onSelect}
            fontScale={fontScale}
          />
          {translation && (
            <p
              style={{
                margin: '-0.6em 0 1.6em',
                fontFamily: '"Spectral", Georgia, serif',
                fontStyle: 'italic',
                fontSize: 16,
                lineHeight: 1.55,
                color: 'var(--text-2)',
                paddingLeft: 16,
                borderLeft: '2px solid var(--border)',
              }}
            >
              {TRANSLATIONS[p]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function InterlinearLayout({ ruby, dark, toneStyle, fontScale, selectedKey, onSelect }) {
  return (
    <div>
      {PARAGRAPHS.map((tokens, p) => (
        <div
          key={p}
          style={{
            marginBottom: '2em',
            paddingBottom: '1.4em',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <Paragraph
            tokens={tokens}
            paraIdx={p}
            dark={dark}
            ruby={ruby}
            toneStyle={toneStyle}
            selectedKey={selectedKey}
            onSelect={onSelect}
            fontScale={fontScale}
          />
          <p
            style={{
              margin: '0.4em 0 0',
              fontFamily: '"Spectral", Georgia, serif',
              fontSize: 17,
              lineHeight: 1.5,
              color: 'var(--text-2)',
              fontStyle: 'italic',
            }}
          >
            {TRANSLATIONS[p]}
          </p>
        </div>
      ))}
    </div>
  );
}

// Keeps the original mandobot card-grid concept available as a study mode.
// Tightened: smaller cards, tone color on chars, consistent sizing.
function GridLayout({ translation, dark, toneStyle, fontScale, selectedKey, onSelect }) {
  const palette = dark ? TONE.dark : TONE.light;
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-3)',
          marginBottom: 14,
          fontFamily: '"IBM Plex Sans", sans-serif',
          fontStyle: 'italic',
        }}
      >
        Vocab grid · every word as a study card. Best for vocabulary review, not flowing reading.
      </div>
      {PARAGRAPHS.map((tokens, p) => (
        <div
          key={p}
          style={{
            marginBottom: 24,
            paddingBottom: 18,
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            {tokens.map((t, i) => {
              if (t.punct) {
                return (
                  <span
                    key={i}
                    style={{
                      fontFamily: '"Noto Serif SC", serif',
                      fontSize: 20,
                      color: 'var(--text-3)',
                      alignSelf: 'center',
                      padding: '0 2px',
                    }}
                  >
                    {t.w}
                  </span>
                );
              }
              const chars = [...t.w];
              const tones = t.t.length === chars.length ? t.t : chars.map(() => t.t[0] || 0);
              const sel = selectedKey === `${p}.${i}`;
              return (
                <button
                  key={i}
                  onClick={(e) => onSelect(p, i, e.currentTarget)}
                  style={{
                    background: sel ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 6,
                    padding: '8px 10px',
                    minWidth: chars.length * 36 + 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    color: 'var(--text)',
                    transition: 'all .14s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <div style={{ display: 'flex', gap: 4 }}>
                    {chars.map((c, k) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: 28,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: '"Noto Serif SC", serif',
                            fontSize: 26,
                            color: palette[tones[k] || 0],
                            lineHeight: 1.1,
                          }}
                        >
                          {c}
                        </span>
                        <span
                          style={{
                            fontFamily: '"IBM Plex Sans", sans-serif',
                            fontSize: 10,
                            color: 'var(--text-3)',
                            marginTop: 1,
                          }}
                        >
                          {(HANZI[c] && HANZI[c].py) || (chars.length === 1 ? t.py : '·')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: '"IBM Plex Sans", sans-serif',
                      fontSize: 11,
                      color: 'var(--text-2)',
                      marginTop: 4,
                      maxWidth: 140,
                      textAlign: 'center',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {t.gloss.split('(')[0].trim()}
                  </div>
                </button>
              );
            })}
          </div>
          {translation && (
            <p
              style={{
                margin: '14px 0 0',
                fontFamily: '"Spectral", Georgia, serif',
                fontSize: 15,
                lineHeight: 1.55,
                color: 'var(--text-2)',
                fontStyle: 'italic',
              }}
            >
              {TRANSLATIONS[p]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------- Tiny chrome controls ----------------
function ChromeBtn({ on, onClick, label, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontFamily: '"IBM Plex Sans", sans-serif',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.02em',
        padding: '6px 12px',
        height: 30,
        borderRadius: 6,
        border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
        background: on ? 'var(--accent-soft)' : 'transparent',
        color: on ? 'var(--accent)' : 'var(--text-2)',
        cursor: 'pointer',
        transition: 'all .14s',
      }}
    >
      {label}
    </button>
  );
}

function chromeBtn() {
  return {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize: 13,
    padding: '7px 14px',
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--text-2)',
    cursor: 'pointer',
  };
}

function chromeIconBtn() {
  return {
    width: 32, height: 30,
    border: '1px solid var(--border)',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--text-2)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all .14s',
  };
}

function SegControl({ items, value, onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: 2,
        gap: 1,
      }}
    >
      {items.map((it) => (
        <button
          key={it.v}
          onClick={() => onChange(it.v)}
          style={{
            fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: 12,
            fontWeight: value === it.v ? 600 : 400,
            padding: '4px 12px',
            border: 'none',
            borderRadius: 5,
            background: value === it.v ? 'var(--bg)' : 'transparent',
            color: value === it.v ? 'var(--text)' : 'var(--text-2)',
            cursor: 'pointer',
            transition: 'all .14s',
            boxShadow: value === it.v ? '0 1px 0 rgba(0,0,0,.05)' : 'none',
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function FontSizeControl({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, border: '1px solid var(--border)', borderRadius: 6 }}>
      <button
        onClick={() => onChange(Math.max(0.85, value - 0.1))}
        style={{ ...chromeIconBtn(), border: 'none', borderRadius: 0, fontSize: 11 }}
      >
        A−
      </button>
      <button
        onClick={() => onChange(Math.min(1.5, value + 0.1))}
        style={{ ...chromeIconBtn(), border: 'none', borderLeft: '1px solid var(--border)', borderRadius: 0, fontSize: 14 }}
      >
        A+
      </button>
    </div>
  );
}

function ThemeControl({ value, onChange }) {
  const items = [
    { v: 'light', label: '☀' },
    { v: 'sepia', label: '◐' },
    { v: 'dark', label: '☾' },
  ];
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: 2,
      }}
    >
      {items.map((it) => (
        <button
          key={it.v}
          onClick={() => onChange(it.v)}
          title={it.v}
          style={{
            width: 26, height: 22,
            border: 'none',
            borderRadius: 5,
            background: value === it.v ? 'var(--bg)' : 'transparent',
            color: value === it.v ? 'var(--text)' : 'var(--text-3)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div
      style={{
        flex: 1,
        height: 4,
        background: 'var(--border-soft)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.round(value * 100)}%`,
          height: '100%',
          background: 'var(--accent)',
        }}
      />
    </div>
  );
}

// ---------------- Icons (line, 18px) ----------------
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 3h8v12l-4-3-4 3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

Object.assign(window, {
  THEMES, TopBar, Sidebar, SavedRail, BottomBar, Reader,
  FlowLayout, InterlinearLayout, GridLayout,
});
