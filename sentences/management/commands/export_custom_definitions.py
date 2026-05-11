"""
Export all words in the CustomDefinition table to a text file, one per line.

Usage:
    python manage.py export_custom_definitions
    python manage.py export_custom_definitions --output missing_words.txt
"""

from django.core.management.base import BaseCommand

from sentences.models import CustomDefinition


class Command(BaseCommand):
    help = 'Export CustomDefinition words to a text file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='custom_definitions.txt',
            help='Output file path (default: custom_definitions.txt)',
        )
        parser.add_argument(
            '--missing-only',
            action='store_true',
            help='Only export words that have no definitions yet',
        )

    def handle(self, *args, **options):
        output_path = options['output']
        qs = CustomDefinition.objects.order_by('added_at')
        if options['missing_only']:
            qs = qs.filter(definitions_en=[])

        words = qs.values_list('word', flat=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            for word in words:
                f.write(word + '\n')

        self.stdout.write(self.style.SUCCESS(
            f'Wrote {qs.count()} words to {output_path}'
        ))
