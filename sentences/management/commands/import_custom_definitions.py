"""
Import definitions from a pipe-delimited text file into the CustomDefinition table.

Expected format (one word per line):
    word | English definition | German definition

Lines with fewer than 3 pipe-separated parts are skipped.

Usage:
    python manage.py import_custom_definitions
    python manage.py import_custom_definitions --input path/to/file.txt
    python manage.py import_custom_definitions --dry-run
"""

from django.core.management.base import BaseCommand

from sentences.models import CustomDefinition


class Command(BaseCommand):
    help = 'Import definitions from a pipe-delimited file into CustomDefinition'

    def add_arguments(self, parser):
        parser.add_argument(
            '--input',
            type=str,
            default='custom_definitions.txt',
            help='Input file path (default: custom_definitions.txt)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Report what would change without writing to the database',
        )

    def handle(self, *args, **options):
        input_path = options['input']
        dry_run = options['dry_run']
        updated = 0
        skipped = 0
        not_found = 0

        with open(input_path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                parts = [p.strip() for p in line.split('|')]
                if len(parts) < 3:
                    continue

                word, en_def, de_def = parts[0], parts[1], parts[2]
                if not word or not en_def or not de_def:
                    continue

                try:
                    custom = CustomDefinition.objects.get(word=word)
                except CustomDefinition.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'Not in table: {word}'))
                    not_found += 1
                    continue

                if custom.definitions_en and custom.definitions_de:
                    skipped += 1
                    continue

                if dry_run:
                    self.stdout.write(f'  would update {word}: en={en_def!r}, de={de_def!r}')
                else:
                    custom.definitions_en = [en_def]
                    custom.definitions_de = [de_def]
                    custom.save(update_fields=['definitions_en', 'definitions_de'])
                updated += 1

        label = 'Would update' if dry_run else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f'{label} {updated} records ({skipped} already had definitions, {not_found} not found in table)'
        ))
