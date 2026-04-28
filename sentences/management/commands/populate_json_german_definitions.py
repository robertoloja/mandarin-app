"""
Management command to populate definitions.de in a reading room JSON file
using German definitions from the CEDefinition table.

Usage:
    python manage.py populate_json_german_definitions path/to/chapter.json

Handles both the "sentence" array and the "dictionary" object.

Lookup cascade for each word (mirrors Segmenter.py English logic):
  1. Exact pronunciation match (with ü → u: normalisation)
  2. Neutral-tone fallback: if any syllable ends in 5, strip that tone number
     and match by bare syllable; break ties via ConstituentHanzi frequency
  3. ConstituentHanzi chain: use pre-linked single-character entries from DB
  4. Character-by-character fallback: look up each character individually
     through the same cascade; compose a "COMPOSED: x / y / z" definition

Items in category 3 or 4 are flagged with a "ZUSAMMENGESETZT:" prefix so they
can be reviewed and replaced with proper editorial definitions later.

Note: CEDICT stores ü as "u:" (e.g. "nu:3"), while the JSON uses the actual
ü character (e.g. "nü3"). Pinyin is normalised before every DB lookup.
"""

import json
from django.core.management.base import BaseCommand, CommandError
from sentences.bilingual_pipeline import lookup_german


class Command(BaseCommand):
    help = 'Populate definitions.de in a reading room JSON file from the DB'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the JSON file to update')

    def handle(self, *args, **options):
        file_path = options['file_path']

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except json.JSONDecodeError:
            raise CommandError(f'Invalid JSON: {file_path}')

        # --- sentence[] section ---
        sentence = data.get('sentence', [])
        s_filled = s_missing = s_skipped = 0

        for word in sentence:
            defs = word.get('definitions', {})
            en_defs = defs.get('en', []) if isinstance(defs, dict) else []
            if not en_defs:
                s_skipped += 1
                continue

            result = lookup_german(word.get('word', ''), word.get('pinyin', []))
            if result:
                word['definitions']['de'] = result
                s_filled += 1
            else:
                word['definitions']['de'] = ['MISSING FROM HANDEDICT']
                s_missing += 1

        # --- dictionary{} section ---
        dictionary = data.get('dictionary', {})
        d_filled = d_missing = 0

        for hanzi, entry in dictionary.items():
            en_defs = entry.get('en', [])
            if not en_defs:
                continue

            result = lookup_german(hanzi, entry.get('pinyin', []))
            if result:
                entry['de'] = result
                d_filled += 1
            else:
                entry['de'] = ['MISSING FROM HANDEDICT']
                d_missing += 1

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        self.stdout.write(self.style.SUCCESS(
            f'sentence: filled={s_filled}, missing={s_missing}, skipped={s_skipped}\n'
            f'dictionary: filled={d_filled}, missing={d_missing}'
        ))
