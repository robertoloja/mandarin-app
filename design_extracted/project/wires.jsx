// Six wireframe directions for Mandarin segmentation reader.
// All share data.jsx primitives. Each component renders inside a fixed-size
// design canvas artboard.

const { useState } = React;

// =====================================================================
// WIRE 1 — Inline Ruby Reader
// Pinyin always-on above each word. Click word → small popover.
// Translation toggleable inline below sentence.
// =====================================================================
function Wire1Ruby({ dark, showTones, words, translation }) {
  const [sel, setSel] = useState(null);
  const [showTr, setShowTr] = useState(true);
  return (
    <div
      style={{
        height: '100%',
        background: dark ? '#15120d' : '#f5f1e8',
        padding: 28,
        fontFamily: '"Patrick Hand", cursive',
        color: dark ? '#e8e4dc' : '#1f1b15',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 22 }}>读 · reader</div>
        <div style={{ display: 'flex', gap: 8, fontSize: 15 }}>
          <SketchBtn dark={dark}>＋ paste</SketchBtn>
          <SketchBtn dark={dark}>★ saved</SketchBtn>
          <SketchBtn dark={dark}>⏱ history</SketchBtn>
          <SketchBtn dark={dark}>☾</SketchBtn>
        </div>
      </div>

      {/* Paste box */}
      <SketchCard dark={dark} dashed padding={14} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 15, color: dark ? '#b8b1a3' : '#7a7264' }}>paste paragraph ↓</span>
        <Scribble width={120} dark={dark} dashed />
        <Scribble width={200} dark={dark} dashed />
        <span style={{ marginLeft: 'auto', fontSize: 14 }}>↵ segment</span>
      </SketchCard>

      {/* Reader */}
      <SketchCard dark={dark} padding={26} style={{ flex: 1 }}>
        <div style={{ marginBottom: 14, fontSize: 14, color: dark ? '#b8b1a3' : '#7a7264' }}>
          ¶ passage 1 · pinyin always shown above
        </div>
        <div style={{ lineHeight: 2.6 }}>
          {words.map((w, i) => (
            <ToneWord
              key={i}
              word={w}
              ruby
              dark={dark}
              showTones={showTones}
              size="md"
              selected={sel === i}
              onClick={() => setSel(sel === i ? null : i)}
            />
          ))}
        </div>

        {/* Inline popover anchored under reader for wireframe clarity */}
        {sel !== null && words[sel] && !words[sel].punct && (
          <div style={{ marginTop: 18, maxWidth: 360 }}>
            <SketchCard dark={dark} padding={14}>
              <WordDetail word={words[sel]} dark={dark} compact onHanziClick={() => {}} />
              <div style={{ display: 'flex', gap: 6, marginTop: 10, fontSize: 13 }}>
                <SketchBtn dark={dark}>★ save</SketchBtn>
                <SketchBtn dark={dark}>⊕ flashcard</SketchBtn>
                <SketchBtn dark={dark}>♪ play</SketchBtn>
              </div>
            </SketchCard>
          </div>
        )}

        {/* Translation toggle */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <SketchBtn dark={dark} active={showTr} onClick={() => setShowTr(!showTr)}>
            {showTr ? '— hide' : '+ show'} translation
          </SketchBtn>
          {showTr && (
            <div
              style={{
                fontFamily: '"Patrick Hand", cursive',
                fontSize: 18,
                fontStyle: 'italic',
                borderLeft: `2px solid ${dark ? '#b8b1a3' : '#7a7264'}`,
                paddingLeft: 12,
                color: dark ? '#b8b1a3' : '#5a5247',
              }}
            >
              {translation}
            </div>
          )}
        </div>
      </SketchCard>

      <div style={{ fontSize: 12, color: dark ? '#7a7264' : '#9a9284', textAlign: 'center' }}>
        WIRE 1 · ruby reader · pinyin always above · inline popover
      </div>
    </div>
  );
}

// =====================================================================
// WIRE 2 — Clean Reader + Floating Popover
// No always-on pinyin. Tones colored. Click → floating popover.
// =====================================================================
function Wire2Popover({ dark, showTones, words, translation }) {
  const [sel, setSel] = useState(3); // pre-select 图书馆 to show popover
  const [showTr, setShowTr] = useState(true);
  return (
    <div
      style={{
        height: '100%',
        background: dark ? '#15120d' : '#f5f1e8',
        padding: 28,
        fontFamily: '"Patrick Hand", cursive',
        color: dark ? '#e8e4dc' : '#1f1b15',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 22 }}>读 reader</div>
        <Scribble width={50} dark={dark} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 14 }}>
          <SketchBtn dark={dark}>aA size</SketchBtn>
          <SketchBtn dark={dark} active={showTones}>tone colors</SketchBtn>
          <SketchBtn dark={dark}>☾ dark</SketchBtn>
        </div>
      </div>

      {/* Reader area, large clean text */}
      <SketchCard dark={dark} padding={32} style={{ flex: 1, position: 'relative' }}>
        <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264', marginBottom: 16 }}>
          ¶ click any word for pinyin + definition
        </div>
        <div style={{ lineHeight: 2 }}>
          {words.map((w, i) => (
            <ToneWord
              key={i}
              word={w}
              dark={dark}
              showTones={showTones}
              size="lg"
              selected={sel === i}
              onClick={() => setSel(sel === i ? null : i)}
            />
          ))}
        </div>

        {/* Floating popover (mocked positioned over the word) */}
        {sel !== null && words[sel] && !words[sel].punct && (
          <div
            style={{
              position: 'absolute',
              left: 240,
              top: 130,
              width: 320,
              zIndex: 5,
            }}
          >
            {/* little tail */}
            <div
              style={{
                position: 'absolute',
                top: -10,
                left: 30,
                width: 16,
                height: 16,
                background: dark ? '#1f1b15' : '#fdfbf6',
                border: `2px solid ${dark ? '#e8e4dc' : '#1f1b15'}`,
                borderRight: 'none',
                borderBottom: 'none',
                transform: 'rotate(45deg)',
              }}
            ></div>
            <SketchCard dark={dark} padding={16}>
              <WordDetail word={words[sel]} dark={dark} onHanziClick={() => {}} />
              <div style={{ display: 'flex', gap: 6, marginTop: 12, fontSize: 13 }}>
                <SketchBtn dark={dark}>★ save</SketchBtn>
                <SketchBtn dark={dark}>⊕ deck</SketchBtn>
                <SketchBtn dark={dark}>♪</SketchBtn>
                <SketchBtn dark={dark} style={{ marginLeft: 'auto' }}>×</SketchBtn>
              </div>
            </SketchCard>
          </div>
        )}

        {/* Translation strip at bottom */}
        <div
          style={{
            position: 'absolute',
            left: 32,
            right: 32,
            bottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <SketchBtn dark={dark} active={showTr} onClick={() => setShowTr(!showTr)}>
            EN
          </SketchBtn>
          {showTr && (
            <div
              style={{
                fontSize: 17,
                fontStyle: 'italic',
                color: dark ? '#b8b1a3' : '#5a5247',
              }}
            >
              {translation}
            </div>
          )}
        </div>
      </SketchCard>

      <div style={{ fontSize: 12, color: dark ? '#7a7264' : '#9a9284', textAlign: 'center' }}>
        WIRE 2 · clean reader · floating popover on click · tones via color only
      </div>
    </div>
  );
}

// =====================================================================
// WIRE 3 — Workbench (3-column power-user)
// Left: history & input. Center: text. Right: persistent inspector.
// =====================================================================
function Wire3Workbench({ dark, showTones, words, translation }) {
  const [sel, setSel] = useState(9); // 历史
  const colBg = dark ? '#1f1b15' : '#fdfbf6';
  const border = `2px solid ${dark ? '#e8e4dc' : '#1f1b15'}`;
  return (
    <div
      style={{
        height: '100%',
        background: dark ? '#15120d' : '#f5f1e8',
        fontFamily: '"Patrick Hand", cursive',
        color: dark ? '#e8e4dc' : '#1f1b15',
        display: 'grid',
        gridTemplateColumns: '240px 1fr 320px',
        gridTemplateRows: '46px 1fr',
      }}
    >
      {/* Top bar full width */}
      <div
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 18px',
          borderBottom: border,
          background: colBg,
        }}
      >
        <div style={{ fontSize: 20 }}>讀 workbench</div>
        <span style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264' }}>· intermediate / advanced mode</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 13 }}>
          <SketchBtn dark={dark}>EN translate</SketchBtn>
          <SketchBtn dark={dark}>⊕ export deck</SketchBtn>
          <SketchBtn dark={dark}>☾</SketchBtn>
        </div>
      </div>

      {/* Left rail */}
      <div style={{ borderRight: border, padding: 14, background: colBg, overflow: 'hidden' }}>
        <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264', marginBottom: 6 }}>paste text</div>
        <div
          style={{
            border: `1.5px dashed ${dark ? '#b8b1a3' : '#7a7264'}`,
            borderRadius: 4,
            padding: 8,
            minHeight: 90,
            fontSize: 14,
          }}
        >
          <Scribble width={150} dark={dark} dashed />
          <br />
          <Scribble width={120} dark={dark} dashed />
          <br />
          <Scribble width={170} dark={dark} dashed />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <SketchBtn dark={dark} style={{ flex: 1, fontSize: 13 }}>segment ↵</SketchBtn>
        </div>

        <div style={{ marginTop: 18, fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264' }}>recent</div>
        {['图书馆 passage', '茶馆 chapter 2', 'news · 经济', '诗 · 静夜思'].map((t, i) => (
          <div
            key={i}
            style={{
              fontSize: 14,
              padding: '6px 8px',
              borderRadius: 4,
              background: i === 0 ? (dark ? '#2a241b' : '#ece7da') : 'transparent',
              marginTop: 4,
              cursor: 'pointer',
            }}
          >
            · {t}
          </div>
        ))}

        <div style={{ marginTop: 18, fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264' }}>★ saved · 47</div>
        {['图书馆', '历史', '关于', '需要'].map((t, i) => (
          <div key={i} style={{ fontSize: 15, fontFamily: '"Noto Serif SC", serif', padding: '3px 8px' }}>
            {t}
          </div>
        ))}
      </div>

      {/* Center — reader */}
      <div style={{ padding: 28, overflow: 'hidden', position: 'relative' }}>
        <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264', marginBottom: 14 }}>
          ¶ 图书馆 passage · click any word to inspect →
        </div>
        <div style={{ lineHeight: 2.2 }}>
          {words.map((w, i) => (
            <ToneWord
              key={i}
              word={w}
              dark={dark}
              showTones={showTones}
              size="lg"
              selected={sel === i}
              onClick={() => setSel(i)}
            />
          ))}
        </div>
        <div
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTop: `1.5px dashed ${dark ? '#5a5247' : '#b8b1a3'}`,
            fontStyle: 'italic',
            fontSize: 17,
            color: dark ? '#b8b1a3' : '#5a5247',
          }}
        >
          EN · {translation}
        </div>
      </div>

      {/* Right inspector */}
      <div
        style={{
          borderLeft: border,
          background: colBg,
          padding: 18,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264' }}>· inspector (always on)</div>
        {sel !== null && words[sel] && (
          <>
            <WordDetail word={words[sel]} dark={dark} onHanziClick={() => {}} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <SketchBtn dark={dark}>★ save word</SketchBtn>
              <SketchBtn dark={dark}>⊕ add to flashcard deck</SketchBtn>
              <SketchBtn dark={dark}>♪ play audio</SketchBtn>
              <SketchBtn dark={dark}>↗ open in dictionary</SketchBtn>
            </div>
            <div style={{ marginTop: 'auto', fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264' }}>
              ←/→ to walk through words
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// WIRE 4 — Sentence Cards Stream
// Each sentence is a card. Each card has its own translation toggle.
// Saved-words rail on the right.
// =====================================================================
function Wire4Cards({ dark, showTones }) {
  const [sel, setSel] = useState(null);
  const [tr1, setTr1] = useState(true);
  const [tr2, setTr2] = useState(false);
  return (
    <div
      style={{
        height: '100%',
        background: dark ? '#15120d' : '#f5f1e8',
        fontFamily: '"Patrick Hand", cursive',
        color: dark ? '#e8e4dc' : '#1f1b15',
        display: 'grid',
        gridTemplateColumns: '1fr 260px',
        gap: 18,
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22 }}>📖 reading</div>
          <span style={{ fontSize: 14, color: dark ? '#b8b1a3' : '#7a7264' }}>
            · 图书馆 passage · 2 sentences · ~3 min
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <SketchBtn dark={dark}>＋ new</SketchBtn>
            <SketchBtn dark={dark}>☾</SketchBtn>
          </div>
        </div>

        {/* Card 1 */}
        <SketchCard dark={dark} padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: dark ? '#b8b1a3' : '#7a7264' }}>① sentence</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <SketchBtn dark={dark} style={{ fontSize: 12 }} active={tr1} onClick={() => setTr1(!tr1)}>
                EN
              </SketchBtn>
              <SketchBtn dark={dark} style={{ fontSize: 12 }}>♪</SketchBtn>
            </div>
          </div>
          <div style={{ lineHeight: 1.9 }}>
            {SAMPLE.map((w, i) => (
              <ToneWord
                key={i}
                word={w}
                dark={dark}
                showTones={showTones}
                size="md"
                selected={sel === '1.' + i}
                onClick={() => setSel(sel === '1.' + i ? null : '1.' + i)}
              />
            ))}
          </div>
          {tr1 && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: `1px dashed ${dark ? '#5a5247' : '#b8b1a3'}`,
                fontStyle: 'italic',
                fontSize: 16,
                color: dark ? '#b8b1a3' : '#5a5247',
              }}
            >
              {TRANSLATION_1}
            </div>
          )}
        </SketchCard>

        {/* Card 2 */}
        <SketchCard dark={dark} padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: dark ? '#b8b1a3' : '#7a7264' }}>② sentence</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <SketchBtn dark={dark} style={{ fontSize: 12 }} active={tr2} onClick={() => setTr2(!tr2)}>
                EN
              </SketchBtn>
              <SketchBtn dark={dark} style={{ fontSize: 12 }}>♪</SketchBtn>
            </div>
          </div>
          <div style={{ lineHeight: 1.9 }}>
            {SAMPLE_2.map((w, i) => (
              <ToneWord
                key={i}
                word={w}
                dark={dark}
                showTones={showTones}
                size="md"
                selected={sel === '2.' + i}
                onClick={() => setSel(sel === '2.' + i ? null : '2.' + i)}
              />
            ))}
          </div>
          {tr2 && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: `1px dashed ${dark ? '#5a5247' : '#b8b1a3'}`,
                fontStyle: 'italic',
                fontSize: 16,
                color: dark ? '#b8b1a3' : '#5a5247',
              }}
            >
              {TRANSLATION_2}
            </div>
          )}
        </SketchCard>

        <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264', textAlign: 'center', padding: 4 }}>
          ↓ paste more text to continue
        </div>
      </div>

      {/* Right rail — saved + history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <SketchCard dark={dark} padding={14} dashed>
          <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264', marginBottom: 6 }}>★ saved · 47</div>
          {SAMPLE.filter((w) => !w.punct && w.w.length > 1).slice(0, 5).map((w, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontSize: 14,
                padding: '3px 0',
              }}
            >
              <span style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 18 }}>{w.w}</span>
              <span style={{ color: dark ? '#b8b1a3' : '#7a7264' }}>{w.py}</span>
            </div>
          ))}
          <SketchBtn dark={dark} style={{ fontSize: 12, width: '100%', marginTop: 6 }}>
            ⊕ export · anki
          </SketchBtn>
        </SketchCard>

        <SketchCard dark={dark} padding={14} dashed>
          <div style={{ fontSize: 13, color: dark ? '#b8b1a3' : '#7a7264', marginBottom: 6 }}>⏱ history</div>
          {['today · 图书馆', 'yesterday · 茶馆', '3d · 经济', '5d · 静夜思'].map((t, i) => (
            <div key={i} style={{ fontSize: 14, padding: '2px 0' }}>· {t}</div>
          ))}
        </SketchCard>
      </div>
    </div>
  );
}

// =====================================================================
// WIRE 5 — Mobile bottom-sheet
// Phone frame. Tap word → bottom sheet slides up.
// =====================================================================
function Wire5Mobile({ dark, showTones, words, translation }) {
  const [sel, setSel] = useState(3); // 图书馆
  const [showTr, setShowTr] = useState(true);
  const sheetH = 320;
  return (
    <div
      style={{
        height: '100%',
        background: dark ? '#0d0a07' : '#e6e1d4',
        fontFamily: '"Patrick Hand", cursive',
        color: dark ? '#e8e4dc' : '#1f1b15',
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 340,
          height: 720,
          background: dark ? '#15120d' : '#f5f1e8',
          border: `3px solid ${dark ? '#e8e4dc' : '#1f1b15'}`,
          borderRadius: 32,
          boxShadow: `5px 5px 0 ${dark ? '#e8e4dc' : '#1f1b15'}`,
          padding: '14px 12px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            padding: '0 8px 4px',
            color: dark ? '#b8b1a3' : '#7a7264',
          }}
        >
          <span>9:41</span>
          <span>● ● ●</span>
        </div>
        {/* notch */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 18,
            background: dark ? '#e8e4dc' : '#1f1b15',
            borderRadius: 9,
          }}
        ></div>

        {/* top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 6px 12px',
            borderBottom: `1.5px dashed ${dark ? '#5a5247' : '#b8b1a3'}`,
          }}
        >
          <span style={{ fontSize: 18 }}>≡</span>
          <span style={{ fontSize: 16 }}>读 · 图书馆</span>
          <span style={{ marginLeft: 'auto', fontSize: 16 }}>★</span>
          <span style={{ fontSize: 16 }}>aA</span>
        </div>

        {/* reader area */}
        <div style={{ flex: 1, padding: '14px 6px', overflow: 'hidden', lineHeight: 2 }}>
          {words.map((w, i) => (
            <ToneWord
              key={i}
              word={w}
              dark={dark}
              showTones={showTones}
              size="md"
              selected={sel === i}
              onClick={() => setSel(sel === i ? null : i)}
            />
          ))}
          <div
            style={{
              marginTop: 12,
              fontSize: 14,
              fontStyle: 'italic',
              color: dark ? '#b8b1a3' : '#5a5247',
              paddingLeft: 8,
              borderLeft: `2px solid ${dark ? '#5a5247' : '#b8b1a3'}`,
              opacity: showTr ? 1 : 0.3,
            }}
          >
            {showTr ? translation : 'tap EN to translate'}
          </div>
        </div>

        {/* bottom sheet */}
        {sel !== null && words[sel] && !words[sel].punct && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: sheetH,
              background: dark ? '#1f1b15' : '#fdfbf6',
              borderTop: `2px solid ${dark ? '#e8e4dc' : '#1f1b15'}`,
              borderRadius: '20px 20px 0 0',
              padding: '10px 18px 18px',
              boxShadow: `0 -4px 0 ${dark ? '#e8e4dc' : '#1f1b15'}33`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 4,
                borderRadius: 2,
                background: dark ? '#5a5247' : '#b8b1a3',
                margin: '0 auto 12px',
              }}
            ></div>
            <WordDetail word={words[sel]} dark={dark} onHanziClick={() => {}} />
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginTop: 12,
                fontSize: 12,
                flexWrap: 'wrap',
              }}
            >
              <SketchBtn dark={dark}>★ save</SketchBtn>
              <SketchBtn dark={dark}>⊕ deck</SketchBtn>
              <SketchBtn dark={dark}>♪ play</SketchBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// WIRE 6 — Focus / distraction-free
// Centered narrow column. Selected word dims everything else.
// Centered modal-ish detail.
// =====================================================================
function Wire6Focus({ dark, showTones, words, translation }) {
  const [sel, setSel] = useState(3);
  return (
    <div
      style={{
        height: '100%',
        background: dark ? '#15120d' : '#f5f1e8',
        fontFamily: '"Patrick Hand", cursive',
        color: dark ? '#e8e4dc' : '#1f1b15',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Tiny floating top-right controls */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 22,
          display: 'flex',
          gap: 6,
          fontSize: 13,
          zIndex: 2,
        }}
      >
        <SketchBtn dark={dark}>aA</SketchBtn>
        <SketchBtn dark={dark}>EN</SketchBtn>
        <SketchBtn dark={dark}>★</SketchBtn>
        <SketchBtn dark={dark}>☾</SketchBtn>
      </div>

      {/* Tiny floating top-left */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 22,
          fontSize: 14,
          color: dark ? '#7a7264' : '#9a9284',
        }}
      >
        ← back
      </div>

      {/* Centered column */}
      <div
        style={{
          maxWidth: 620,
          margin: '0 auto',
          paddingTop: 86,
          paddingBottom: 80,
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: dark ? '#7a7264' : '#9a9284',
            textAlign: 'center',
            marginBottom: 18,
          }}
        >
          · 图书馆 passage · 1 / 3 ·
        </div>
        <div style={{ lineHeight: 2.4, textAlign: 'left' }}>
          {words.map((w, i) => (
            <span
              key={i}
              style={{ opacity: sel !== null && sel !== i && !w.punct ? 0.35 : 1, transition: 'opacity .2s' }}
            >
              <ToneWord
                word={w}
                dark={dark}
                showTones={showTones}
                size="lg"
                selected={sel === i}
                onClick={() => setSel(sel === i ? null : i)}
              />
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 17,
            fontStyle: 'italic',
            textAlign: 'left',
            color: dark ? '#b8b1a3' : '#5a5247',
          }}
        >
          {translation}
        </div>
      </div>

      {/* Centered detail card (mock — appears when word selected) */}
      {sel !== null && words[sel] && !words[sel].punct && (
        <>
          {/* dim overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: dark ? 'rgba(0,0,0,0.45)' : 'rgba(245,241,232,0.7)',
              backdropFilter: 'blur(2px)',
              zIndex: 3,
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 40,
              transform: 'translateX(-50%)',
              width: 440,
              zIndex: 4,
            }}
          >
            <SketchCard dark={dark} padding={18}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: dark ? '#b8b1a3' : '#7a7264' }}>esc to close</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: dark ? '#b8b1a3' : '#7a7264' }}>
                  ← / → walk through words
                </span>
              </div>
              <WordDetail word={words[sel]} dark={dark} onHanziClick={() => {}} />
              <div style={{ display: 'flex', gap: 6, marginTop: 12, fontSize: 13 }}>
                <SketchBtn dark={dark}>★ s</SketchBtn>
                <SketchBtn dark={dark}>⊕ d</SketchBtn>
                <SketchBtn dark={dark}>♪ p</SketchBtn>
                <SketchBtn dark={dark} style={{ marginLeft: 'auto' }}>esc ×</SketchBtn>
              </div>
            </SketchCard>
          </div>
        </>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 12,
          color: dark ? '#7a7264' : '#9a9284',
          zIndex: 1,
        }}
      >
        WIRE 6 · focus · dim everything else · keyboard-driven
      </div>
    </div>
  );
}

Object.assign(window, { Wire1Ruby, Wire2Popover, Wire3Workbench, Wire4Cards, Wire5Mobile, Wire6Focus });
