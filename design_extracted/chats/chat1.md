# Mandarin Sentence Analyzer

_Started 2026-05-09 10:22 UTC_

---

## User

This is a web app that allows users to input mandarin sentences. It then displays the word-segmented version of those sentence. Each word of the sentence includes the pronunciation and definition of that word, and can be clicked on to show the pronunciation and definition of each individual Hanzi in the word.

## Assistant

_[tool: questions_v2]_

## User

Questions answered:
- platform: Both / responsive
- audience: Intermediate / advanced learners
- input_modes: Paste a long paragraph
- interaction: Click word → tooltip/popover
- info_per_word: Pinyin, Pinyin and definition
- info_per_hanzi: Pinyin, Pinyin and definition
- tone_display: Both color + marks
- translation: Yes, toggleable
- extras: Save / favorite words, Dark mode, Flashcard export, Reading history
- vibe: Light color highlights for tones
- variations: 6

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

I'll sketch 6 distinct wireframe directions for the Mandarin reader. Let me set up the canvas first.

_[tool: read_file]_

_[tool: write_file]_

Now I'll build the wireframe explorations. I'll create a sample data module, then 6 wireframes inside a design canvas.

**System I'm using:** Patrick Hand for UI/handwritten labels, Noto Serif SC for Chinese characters (legibility matters even in low-fi). Tone colors as light pastels (T1 red, T2 amber, T3 green, T4 blue, neutral gray) per your "light color highlights for tones" pick. Borders are 1.5–2px solid charcoal with offset shadows for the hand-drawn stacked feel.

_[tool: write_file]_

_[tool: write_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

_[tool: snip]_

_[tool: update_todos]_

Six wireframes are on the canvas — five desktop (ruby reader, clean+popover, 3-col workbench, sentence cards, focus mode) plus one mobile bottom-sheet. Click any word inside a wire to see how that direction handles the popover/sheet/inspector. Tweaks panel toggles tone colors and a dark preview.

Tell me which direction(s) feel right and I'll push that one to higher fidelity — or mix elements (e.g. workbench's persistent inspector + focus mode's dimming).

## User

Let's switch to high fidelity designs. Iterate on this design: https://mandobot.com/reading/diary-of-a-madman/1

## Assistant

_[tool: snip]_

_[tool: update_todos]_

_[tool: web_fetch]_

_[tool: web_fetch]_

_[tool: web_search]_

I can't access mandobot.com from here, and I shouldn't reproduce its specific UI anyway — but the pattern (segmented Mandarin reader with click-for-pinyin + per-hanzi drilldown) is well-understood. I'll design an original high-fidelity reader using Lu Xun's *Diary of a Madman* Chapter 1 (public domain) as the sample text, leading with dark theme since you toggled it on.

**System I'll commit to:**
- **Type:** Spectral (serif) for English/translation, Noto Serif SC for Chinese, IBM Plex Sans for UI chrome
- **Palette (dark):** warm slate bg `oklch(0.18 0.01 60)`, cream text, single warm-gold accent `oklch(0.78 0.12 70)` for hover/active
- **Tones:** characters colored by tone (T1 red, T2 amber, T3 green, T4 blue, neutral gray) — muted, not garish. Pinyin marks satisfy the "marks" half
- **Segmentation:** small gap between word tokens, plus a hairline underline that bridges multi-char words on hover
- **Layout:** left chapter rail + center reader column + click-anchored popover; bottom controls bar

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

## User

Improve this design and explain your improvements

## Assistant

_[tool: write_file]_

Now I can see what mandobot looks like. Looking at it carefully, I see real problems to fix:

**What's not working in the original:**

1. **Cards-per-word destroys reading.** Every word boxed equally → you can never *read*, you can only *scan a vocabulary table*. There's no rhythm, no grammar visible, no place for the eye to rest.
2. **Information overload, always-on.** Pinyin AND English under every single word, every time. An intermediate/advanced learner doesn't need 我=I and 的=possessive on every page. It should be progressive.
3. **Tones aren't visualized.** Pure grayscale — the strongest free win in a Mandarin reader (color = tone) is sitting unused.
4. **Sentence shape is gone.** Punctuation floats between cards like loose dust; you can't see paragraph structure, sentence breaks, or grammatical chunks.
5. **Modal popover dims everything.** Tapping a word shouldn't take you out of the page. An inline popover near the click-target keeps you in the reading flow.
6. **Top bar is icon soup.** 8 unlabeled icons of identical visual weight. Hard to learn, hard to use.
7. **Translation drawer overlays the text** instead of sitting alongside it.
8. **Chapter/progress context is missing** — you don't know where you are in the work.
9. **Typography feels like a database tool**, not literature.

**My improvements (the design I'll build):**

| Original | Improved |
|---|---|
| Grid of word-cards | **Prose flow** — segmented by gap, reads like a book |
| Pinyin always shown | **Pinyin off by default**; togglable as ruby annotations |
| Grayscale | **Tone-colored characters** (T1 red, T2 amber, T3 green, T4 blue) — muted, literary |
| Full-screen modal popover | **Inline popover** anchored to the word, with hanzi-drill expansion |
| Translation drawer covers text | **Translation alongside** (interlinear option) or below paragraph |
| Icon-only chrome | **Labeled controls** + reduced count |
| No chapter context | **Left chapter rail** with progress |
| Single layout | **3 reading modes:** Flow / Interlinear / Vocab grid (original-style, kept as a study tool) |
| Single character cards lose meaning | **Per-hanzi drill** is *inside* the popover, not the default view |
| Editorial type ignored | **Spectral** (English), **Noto Serif SC** (Chinese), **IBM Plex Sans** (chrome) |

I'll also keep a "Vocab grid" mode available as a third layout — their original idea is genuinely useful for vocabulary review, just not as the *default reading* view.

Let me build the app:

_[tool: snip]_

_[tool: snip]_

_[tool: write_file]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

_[tool: update_todos]_

Hi-fi reader's live in **Mandarin Reader.html**. Click any word to see the inline popover with pinyin, definition, and per-hanzi drill tiles. Try the layout segmented control (Flow / Interlinear / Vocab grid) and the theme switcher in the top bar — Tweaks panel exposes the same plus tone style and font scale.

## User

The app must be able to display pronunciation in accented pinyin, numbered pinyin, and zhuyin. The translation is available in German and English.

## Assistant

_[tool: snip]_

_[tool: update_todos]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: grep]_

_[tool: write_file]_

