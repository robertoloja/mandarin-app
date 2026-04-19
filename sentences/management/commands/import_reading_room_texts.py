"""
Management command to import Reading Room texts from JSON files.

Usage:
    python manage.py import_reading_room_texts path/to/file.json

The JSON file should have the following structure:
{
  "book": "Romance of Three Kingdoms",
  "book_order": 1,
  "chapters": [
    {
      "chapter_number": "一",
      "chapter_order": 1,
      "title": "Chapter 1: Opening",
      "source": "Translated by...",
      "license": "CC-BY-SA...",
      "translations": {
        "en": [
          {"chinese": "...", "english": "...", "pinyin": "..."},
          ...
        ],
        "de": [
          {"chinese": "...", "german": "...", "pinyin": "..."},
          ...
        ]
      }
    },
    ...
  ]
}
"""

import json
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from sentences.models import ReadingRoomText, ReadingRoomTranslation


class Command(BaseCommand):
    help = 'Import Reading Room texts from JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            'file_path',
            type=str,
            help='Path to the JSON file containing reading room data'
        )
        parser.add_argument(
            '--update',
            action='store_true',
            help='Update existing texts instead of skipping them'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be imported without actually saving'
        )

    def handle(self, *args, **options):
        file_path = options['file_path']
        update_existing = options['update']
        dry_run = options['dry_run']

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except json.JSONDecodeError:
            raise CommandError(f'Invalid JSON in file: {file_path}')

        book = data.get('book')
        book_order = data.get('book_order')
        chapters = data.get('chapters', [])

        if not book or book_order is None:
            raise CommandError('JSON must contain "book" and "book_order" fields')

        if not chapters:
            raise CommandError('JSON must contain "chapters" array')

        self.stdout.write(
            self.style.SUCCESS(
                f'Found {len(chapters)} chapters in "{book}"'
            )
        )

        created_count = 0
        updated_count = 0
        error_count = 0

        try:
            with transaction.atomic():
                for chapter_data in chapters:
                    try:
                        text = self._process_chapter(
                            book, book_order, chapter_data, update_existing
                        )
                        if text:
                            if hasattr(text, '_created'):
                                created_count += 1
                            else:
                                updated_count += 1
                    except Exception as e:
                        error_count += 1
                        self.stdout.write(
                            self.style.ERROR(
                                f'  Error processing chapter {chapter_data.get("chapter_number")}: {str(e)}'
                            )
                        )

                if dry_run:
                    raise CommandError('DRY RUN: Rolling back changes')

        except CommandError as e:
            if 'DRY RUN' in str(e):
                self.stdout.write(
                    self.style.SUCCESS(
                        f'\nDRY RUN SUMMARY:\n'
                        f'  Would create: {created_count}\n'
                        f'  Would update: {updated_count}\n'
                        f'  Errors: {error_count}'
                    )
                )
            else:
                raise

        if not dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\nIMPORT COMPLETE:\n'
                    f'  Created: {created_count}\n'
                    f'  Updated: {updated_count}\n'
                    f'  Errors: {error_count}'
                )
            )

    def _process_chapter(self, book, book_order, chapter_data, update_existing):
        """Process a single chapter and its translations."""
        chapter_number = chapter_data.get('chapter_number')
        chapter_order = chapter_data.get('chapter_order')
        title = chapter_data.get('title')
        source = chapter_data.get('source', '')
        license = chapter_data.get('license', '')
        translations = chapter_data.get('translations', {})

        if not all([chapter_number, chapter_order is not None, title]):
            raise ValueError('Missing required chapter fields')

        # Get or create the ReadingRoomText
        text, created = ReadingRoomText.objects.get_or_create(
            book=book,
            book_order=book_order,
            chapter_order=chapter_order,
            defaults={
                'chapter_number': chapter_number,
                'title': title,
                'source': source,
                'license': license,
            }
        )

        if not created and update_existing:
            text.chapter_number = chapter_number
            text.title = title
            text.source = source
            text.license = license
            text.save()

        # Import translations
        for language, content in translations.items():
            ReadingRoomTranslation.objects.update_or_create(
                text=text,
                language=language,
                defaults={'json_data': content}
            )

        text._created = created
        self.stdout.write(
            self.style.SUCCESS(
                f'  {"Created" if created else "Updated"}: Chapter {chapter_number} - {title}'
            )
        )

        return text
