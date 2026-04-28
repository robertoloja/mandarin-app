"""
Management command to load a fully-populated bilingual chapter JSON into the
ReadingRoomChapter table.

Usage:
    python manage.py load_chapter_json <share_id> <path/to/chapter.json>

The share_id must exist in sentences/chapter_registry.py.
The JSON file must already have the target shape (translation, sentence, dictionary).
If a ReadingRoomChapter already exists for this book/chapter_order it is updated.

Example:
    python manage.py load_chapter_json njxoalFOGc \\
        frontend/src/app/experimental/reading/two_brothers.json
"""

import json
from django.core.management.base import BaseCommand, CommandError
from sentences.chapter_registry import CHAPTER_REGISTRY
from sentences.models.ReadingRoomChapter import ReadingRoomChapter


class Command(BaseCommand):
    help = 'Load a bilingual chapter JSON file into ReadingRoomChapter'

    def add_arguments(self, parser):
        parser.add_argument('share_id', type=str, help='share_id from chapter_registry.py')
        parser.add_argument('file_path', type=str, help='Path to the bilingual JSON file')

    def handle(self, *args, **options):
        share_id = options['share_id']
        file_path = options['file_path']

        if share_id not in CHAPTER_REGISTRY:
            raise CommandError(
                f"Unknown share_id '{share_id}'. "
                f"Add it to sentences/chapter_registry.py first."
            )

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except json.JSONDecodeError:
            raise CommandError(f'Invalid JSON: {file_path}')

        for key in ('translation', 'sentence', 'dictionary'):
            if key not in data:
                raise CommandError(f"JSON is missing required key: '{key}'")

        meta = CHAPTER_REGISTRY[share_id]
        chapter, created = ReadingRoomChapter.objects.update_or_create(
            book_slug=meta['book_slug'],
            chapter_order=meta['chapter_order'],
            defaults={
                'chapter_number': meta['chapter_number'],
                'title': meta['title'],
                'data': data,
            },
        )

        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f"{action}: {meta['book_title']} Ch. {meta['chapter_number']} — {meta['title']}"
        ))
