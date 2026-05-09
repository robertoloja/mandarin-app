# Reading Room Ingest Pipeline

## Admin tools

### Ingest Pre-segmented Chapter
`/admin/sentences/readingroomchapter/ingest/`

Accepts:
- **Book metadata** — book slug, book title, chapter order (0-based sort key), chapter number (display string, e.g. `"2"`), English chapter title, German chapter title
- **Chinese text** — space-separated tokens; double blank line between paragraphs becomes a paragraph-break sentinel in the word array
- **Full-text translations** — English and German prose translations

On submit:
1. Parses tokens via `_parse_segmented_input` (normalises `\r\n`, splits on blank lines for paragraph breaks)
2. Builds chapter JSON via `build_chapter_data_from_tokens` — dragonmapper for pinyin/zhuyin, CEDictionary + CEDefinition for word definitions, ConstituentHanzi for the character dictionary. Words not found in CEDictionary are logged to `CustomDefinition` with empty definitions and output as `{'en': [], 'de': []}`.
3. Saves a `ReadingRoomChapter` via `update_or_create(book_slug, chapter_order)` — re-submitting the same book/order overwrites the existing record.
4. Appends a new entry to `sentences/chapter_registry.py`.

### Edit Translations
`/admin/sentences/readingroomchapter/<pk>/edit-translations/`

Allows editing the German chapter title (`title_de`), English translation, and German translation without re-ingesting.

### Custom Definitions
`/admin/sentences/customdefinition/`

Lists all words that were not found in CEDictionary at ingest time. Words appear here automatically. Fill in `definitions_en` and `definitions_de` directly in the admin, or use the management command workflow below.

---

## Adding a new chapter — full workflow

### 1. Ingest the text
Submit the **Ingest Pre-segmented Chapter** form. Verify:
- `chapter_order` is correct before submitting — the wrong value silently overwrites an existing chapter.
- Paragraph breaks in the Chinese text are separated by **double blank lines**.

### 2. Handle missing definitions
After ingest, some words will be in `CustomDefinition` with empty definitions. To fill them in bulk:

```bash
# Export words still missing definitions to a text file
python manage.py export_custom_definitions --missing-only

# MANUAL STEP: Edit custom_definitions.txt — add | English definition | German definition after each word:
#   玄德 | Xuande (style name of Liu Bei) | Xuande (Hofname von Liu Bei)

# Import the filled-in definitions, promote them into CEDictionary + ConstituentHanzi,
# and re-bake ReadingRoomChapter data so definitions, zhuyin, and
# constituent character entries are all correct in the frontend
python manage.py update_custom_definitions
```

`update_custom_definitions` is idempotent — already-promoted words are skipped on CEDictionary creation, and chapter data is always re-baked from the current CEDictionary state. Use `--promote-only` to skip the file import step (e.g. after adding definitions directly in the admin).

### 3. Wire up the frontend
Three files need updating for the chapter to appear in the reading room navigation:

1. **`frontend/src/localization/reading_room.ts`** — add `en` and `de` title entries under the appropriate book section.
2. **`frontend/src/app/reading/hooks/useReadingBooks.ts`** — add a subchapter entry with `book_slug` and `chapter_order`.
3. **`frontend/src/app/reading/[book_slug]/[chapter_order]/page.tsx`** — increment the `Array.from({ length: N })` counter for the relevant book in `generateStaticParams`.

---

## Management commands reference

| Command | Purpose |
|---|---|
| `export_custom_definitions [--missing-only]` | Export CustomDefinition words to `custom_definitions.txt`. `--missing-only` limits output to words with empty definitions. |
| `update_custom_definitions [--input FILE] [--promote-only]` | Import pipe-delimited `word \| en \| de` definitions into CustomDefinition, then promote to CEDictionary + ConstituentHanzi and re-bake all ReadingRoomChapter data. `--promote-only` skips the file import step. |
| `scan_missing_definitions [--dry-run]` | Diagnostic: scans all chapter data for `{}` definition entries, logs them to CustomDefinition, and patches them to `{'en': [], 'de': []}` to prevent frontend crashes. Normally not needed — the ingest pipeline handles this automatically. |

---

## chapter_registry.py

`sentences/chapter_registry.py` is the source of truth for chapter metadata (book slug, title, German title, chapter order). It is appended to automatically on each ingest. If a chapter's German title needs correcting after the fact, update both the registry entry and the `ReadingRoomChapter.data['title_de']` field (via Edit Translations or a shell patch).
