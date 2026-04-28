"""
Registry of all known reading room chapters, keyed by share_id (sentence_id
in SentenceHistory). Derived from frontend/src/app/reading/page.tsx.

Each entry:
    book_slug      — URL-safe book identifier
    book_title     — Human-readable book title (English)
    chapter_order  — 0-based integer sort key
    chapter_number — Indo-Arabic numeral string ("0", "1", ... "13")
    title          — English chapter title
"""

CHAPTER_REGISTRY: dict[str, dict] = {
    # ── Diary of a Madman (狂人日記) ─────────────────────────────────────────
    "njxoalFOGc": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 0,
        "chapter_number": "0",
        "title": "Two Brothers",
    },
    "e8PZ8KFE5Y": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 1,
        "chapter_number": "1",
        "title": "A Very Good Moon",
    },
    "IlzDKJkIWL": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 2,
        "chapter_number": "2",
        "title": "No Moonlight Whatsoever",
    },
    "hOu4JeH5lZ": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 3,
        "chapter_number": "3",
        "title": "Couldn't Fall Asleep",
    },
    "xTIybS2MU9": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 4,
        "chapter_number": "4",
        "title": "Sat Quietly for a While",
    },
    "YlfLF2_Whw": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 5,
        "chapter_number": "5",
        "title": "A Step Back",
    },
    "NUw5_ruh3H": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 6,
        "chapter_number": "6",
        "title": "Pitch Black",
    },
    "9d2ulbbTOg": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 7,
        "chapter_number": "7",
        "title": "Their Methods",
    },
    "mHOt29iUOn": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 8,
        "chapter_number": "8",
        "title": "Somebody Came",
    },
    "-GdH2hZ0h_": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 9,
        "chapter_number": "9",
        "title": "They Want to Eat People",
    },
    "YwexFVjfJ_": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 10,
        "chapter_number": "10",
        "title": "Early in the Morning",
    },
    "y1YXd7xxo2": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 11,
        "chapter_number": "11",
        "title": "The Sun Has Not Come Out",
    },
    "rPqZ4_WGFo": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 12,
        "chapter_number": "12",
        "title": "I Cannot Think About It",
    },
    "wl2tMdK8X1": {
        "book_slug": "diary-of-a-madman",
        "book_title": "Diary of a Madman",
        "chapter_order": 13,
        "chapter_number": "13",
        "title": "Perhaps...",
    },
    # ── Romance of the Three Kingdoms (三國演義) — subchapters of chapter 一 ──
    "wSE4FONhWj": {
        "book_slug": "romance-of-the-three-kingdoms",
        "book_title": "Romance of the Three Kingdoms",
        "chapter_order": 0,
        "chapter_number": "1",
        "title": "Oath of the Peach Garden — Poem",
    },
    "hErMG8iNOo": {
        "book_slug": "romance-of-the-three-kingdoms",
        "book_title": "Romance of the Three Kingdoms",
        "chapter_order": 1,
        "chapter_number": "1",
        "title": "Oath of the Peach Garden — Great Teacher",
    },
    "RMY5TrW0T6": {
        "book_slug": "romance-of-the-three-kingdoms",
        "book_title": "Romance of the Three Kingdoms",
        "chapter_order": 2,
        "chapter_number": "1",
        "title": "Oath of the Peach Garden — Yellow Turbans",
    },
    "MbGAhlo54Y": {
        "book_slug": "romance-of-the-three-kingdoms",
        "book_title": "Romance of the Three Kingdoms",
        "chapter_order": 3,
        "chapter_number": "1",
        "title": "Oath of the Peach Garden — Meetings",
    },
    "Q7GnxMzcNw": {
        "book_slug": "romance-of-the-three-kingdoms",
        "book_title": "Romance of the Three Kingdoms",
        "chapter_order": 4,
        "chapter_number": "1",
        "title": "Oath of the Peach Garden — The Oath",
    },
    "59Yb0VElht": {
        "book_slug": "romance-of-the-three-kingdoms",
        "book_title": "Romance of the Three Kingdoms",
        "chapter_order": 5,
        "chapter_number": "1",
        "title": "Oath of the Peach Garden — Liu Bei's Triumphs",
    },
    "S6c9Ie5ZkS": {
        "book_slug": "romance-of-the-three-kingdoms",
        "book_title": "Romance of the Three Kingdoms",
        "chapter_order": 6,
        "chapter_number": "1",
        "title": "Oath of the Peach Garden — Dong Zhuo's Betrayal",
    },
}
