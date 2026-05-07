"""
Promote CustomDefinition entries into the main CEDictionary + ConstituentHanzi
tables, then re-bake ReadingRoomChapter data so every word has correct
pronunciations, definitions, and character-level dictionary entries.

Only processes CustomDefinition records that have non-empty definitions.
Skips words already present in CEDictionary.

Usage:
    python manage.py promote_custom_definitions
    python manage.py promote_custom_definitions --dry-run
"""

import re

from django.core.management.base import BaseCommand
from dragonmapper import hanzi as hanzi_utils

from sentences.bilingual_pipeline import (
    find_cedict,
    lookup_german,
    de_from_cedict,
    normalize_pinyin,
)
from sentences.models import CustomDefinition
from sentences.models.CEDictionary import CEDictionary
from sentences.models.ConstituentHanzi import ConstituentHanzi
from sentences.models.ReadingRoomChapter import ReadingRoomChapter


def _pinyin_to_zhuyin(pinyin: str) -> str:
    if ':' not in pinyin:
        return hanzi_utils.pinyin_to_zhuyin(pinyin)
    number = pinyin[-1]
    return hanzi_utils.pinyin_to_zhuyin(pinyin[:-3] + 'ü' + number)


class Command(BaseCommand):
    help = 'Promote CustomDefinition entries to CEDictionary and re-bake chapter data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report what would change without writing to the database',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        created_count = 0
        skipped_count = 0
        no_defs_count = 0

        customs = CustomDefinition.objects.exclude(definitions_en=[])

        for custom in customs:
            word = custom.word
            pinyin = custom.pinyin  # list of pinyin syllables (with ü)

            # Already in CEDictionary?
            if CEDictionary.objects.filter(traditional=word).exists() or \
               CEDictionary.objects.filter(simplified=word).exists():
                skipped_count += 1
                continue

            pronunciation = normalize_pinyin(' '.join(pinyin))
            definitions_str = '/'.join(custom.definitions_en)

            try:
                traditional = word if hanzi_utils.is_traditional(word) else hanzi_utils.to_traditional(word)
            except Exception:
                traditional = word
            try:
                simplified = hanzi_utils.to_simplified(word)
            except Exception:
                simplified = traditional

            if dry_run:
                self.stdout.write(
                    f'  would add: {word}  trad={traditional}  simp={simplified}  '
                    f'pron={pronunciation}  defs={definitions_str!r}'
                )
                created_count += 1
                continue

            entry = CEDictionary.objects.create(
                traditional=traditional,
                simplified=simplified,
                word_length=len(word),
                pronunciation=pronunciation,
                definitions=definitions_str,
            )

            # Link constituent characters
            for i, char in enumerate(word):
                char_pinyin = [pinyin[i]] if i < len(pinyin) else []
                char_cedict = find_cedict(char, char_pinyin)
                if char_cedict:
                    ConstituentHanzi.objects.get_or_create(
                        word=entry,
                        hanzi=char_cedict,
                        order=i,
                    )

            self.stdout.write(f'  added: {word} ({pronunciation})')
            created_count += 1

        if not dry_run:
            self._rebake_chapters()

        label = 'Would create' if dry_run else 'Created'
        self.stdout.write(self.style.SUCCESS(
            f'{label} {created_count} CEDictionary entries '
            f'({skipped_count} already existed, {no_defs_count} skipped — no definitions)'
        ))

    def _rebake_chapters(self):
        """
        Re-apply word entries in ReadingRoomChapter.data using the now-populated
        CEDictionary, adding correct definitions, pronunciations, and dictionary
        entries for words that previously fell back to CustomDefinition.
        """
        from sentences.models import CustomDefinition

        custom_words = set(
            CustomDefinition.objects.exclude(definitions_en=[]).values_list('word', flat=True)
        )

        patched_chapters = 0
        patched_words = 0

        for chapter in ReadingRoomChapter.objects.all():
            dirty = False
            sentence = chapter.data.get('sentence', [])
            dictionary = chapter.data.get('dictionary', {})

            for entry in sentence:
                word = entry.get('word', '')
                if word not in custom_words:
                    continue

                pinyin = entry.get('pinyin', [])
                cedict = find_cedict(word, pinyin)
                if not cedict:
                    continue

                en_defs = [d.strip() for d in cedict.definitions.split('/') if d.strip()]
                de_defs = lookup_german(word, pinyin) or ['MISSING FROM HANDEDICT']
                entry['definitions'] = {'en': en_defs, 'de': de_defs}
                dirty = True
                patched_words += 1

                # Add constituent characters to the dictionary section
                constituents = cedict.get_hanzi()
                if constituents:
                    for ch in constituents:
                        char = ch.traditional if word == cedict.traditional else ch.simplified
                        dictionary[char] = {
                            'en': [ch.definitions],
                            'de': de_from_cedict(ch) or [ch.definitions],
                            'pinyin': [ch.pronunciation.replace('u:', 'ü')],
                            'zhuyin': [_pinyin_to_zhuyin(ch.pronunciation)],
                        }
                else:
                    for i, char in enumerate(word):
                        char_pinyin = [pinyin[i]] if i < len(pinyin) else []
                        char_cedict = find_cedict(char, char_pinyin)
                        if char_cedict:
                            dictionary[char] = {
                                'en': [char_cedict.definitions],
                                'de': de_from_cedict(char_cedict) or [char_cedict.definitions],
                                'pinyin': [char_cedict.pronunciation.replace('u:', 'ü')],
                                'zhuyin': [_pinyin_to_zhuyin(char_cedict.pronunciation)],
                            }

            if dirty:
                chapter.data['dictionary'] = dictionary
                chapter.save(update_fields=['data'])
                patched_chapters += 1

        self.stdout.write(self.style.SUCCESS(
            f'Re-baked {patched_words} word entries across {patched_chapters} chapters'
        ))
