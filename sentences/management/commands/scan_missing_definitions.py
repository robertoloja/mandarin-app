"""
Scan all ReadingRoomChapter records for words with missing definitions ({}),
log them to the CustomDefinition table, and patch the chapter data so the
frontend doesn't crash (replaces {} with {'en': [], 'de': []}).

Usage:
    python manage.py scan_missing_definitions
    python manage.py scan_missing_definitions --dry-run
"""

from django.core.management.base import BaseCommand
from dragonmapper import hanzi as hanzi_utils

from sentences.functions import is_punctuation
from sentences.models import CustomDefinition
from sentences.models.ReadingRoomChapter import ReadingRoomChapter


class Command(BaseCommand):
    help = 'Log missing definitions to CustomDefinition and patch chapter data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report what would change without writing to the database',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        logged = 0
        already_known = 0
        patched_chapters = 0

        for chapter in ReadingRoomChapter.objects.all():
            sentence = chapter.data.get('sentence', [])
            chapter_dirty = False

            for entry in sentence:
                word = entry.get('word', '')
                defs = entry.get('definitions')

                if defs != {} or not word or not hanzi_utils.has_chinese(word) or is_punctuation(word):
                    continue

                pinyin = entry.get('pinyin', [])

                if dry_run:
                    exists = CustomDefinition.objects.filter(word=word).exists()
                    if exists:
                        already_known += 1
                        self.stdout.write(f'  known   {word} ({" ".join(pinyin)})')
                    else:
                        logged += 1
                        self.stdout.write(f'  missing {word} ({" ".join(pinyin)}) — {chapter}')
                else:
                    _, created = CustomDefinition.objects.get_or_create(
                        word=word,
                        defaults={'pinyin': pinyin},
                    )
                    if created:
                        logged += 1
                    else:
                        already_known += 1

                    entry['definitions'] = {'en': [], 'de': []}
                    chapter_dirty = True

            if chapter_dirty and not dry_run:
                chapter.save(update_fields=['data'])
                patched_chapters += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(
                f'\nDry run — {logged} new missing words found, {already_known} already in CustomDefinition'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Logged {logged} new missing words to CustomDefinition '
                f'({already_known} already known), patched {patched_chapters} chapters'
            ))
