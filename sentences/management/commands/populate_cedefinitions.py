"""
Management command to populate CEDefinition table from CEDICT and Handedict.

This command:
1. Creates CEDefinition entries for English (from CEDictionary.definitions)
2. Creates CEDefinition entries for German (from Handedict)
"""

import os
import re
from django.core.management.base import BaseCommand
from django.db import transaction

from sentences.models import CEDictionary, CEDefinition


class Command(BaseCommand):
    help = "Populate CEDefinition table with English and German definitions"

    def add_arguments(self, parser):
        parser.add_argument(
            '--language',
            type=str,
            default='all',
            choices=['en', 'de', 'all'],
            help='Which language to populate (default: all)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing CEDefinition entries before populating'
        )

    def parse_cedict_line(self, line):
        """Parse a CEDICT/Handedict format line.
        
        Format: Traditional Simplified [pin yin] /definition1/definition2/
        
        Returns:
            tuple: (traditional, simplified, pinyin, definitions_list) or None if invalid
        """
        if not line or line.startswith('#'):
            return None

        # Parse the line format
        match = re.match(
            r'^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+/(.*)/$',
            line.strip()
        )

        if not match:
            return None

        traditional, simplified, pinyin, definitions_str = match.groups()
        definitions = definitions_str.split('/')
        
        return traditional, simplified, pinyin, definitions

    def populate_english(self):
        """Populate English definitions from CEDictionary."""
        self.stdout.write("Populating English definitions from CEDictionary...")
        
        count = 0
        skipped = 0

        # Get or create English definitions for existing CEDictionary entries
        for cedict in CEDictionary.objects.all():
            try:
                CEDefinition.objects.get_or_create(
                    cedict=cedict,
                    language='en',
                    defaults={'definitions': cedict.definitions}
                )
                count += 1
                
                if count % 5000 == 0:
                    self.stdout.write(f"  Processed {count} entries...")
                    
            except Exception as e:
                skipped += 1
                if skipped <= 10:  # Show first 10 errors
                    self.stdout.write(
                        self.style.WARNING(
                            f"Error creating English definition for {cedict}: {e}"
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} English definitions (skipped: {skipped})"
            )
        )

    def populate_german(self):
        """Populate German definitions from Handedict.
        
        Uses the same approach as English: iterate through CEDictionary entries
        and find matching Handedict definitions, ensuring all entries get checked.
        """
        self.stdout.write("Populating German definitions from Handedict...")
        
        handedict_path = os.path.join(
            os.path.dirname(__file__),
            '../../../static/handedict.u8'
        )

        if not os.path.exists(handedict_path):
            self.stdout.write(
                self.style.ERROR(f"Handedict file not found at {handedict_path}")
            )
            return

        # First, build a lookup dictionary from Handedict
        handedict_map = {}
        with open(handedict_path, 'r', encoding='utf-8') as f:
            for line in f:
                parsed = self.parse_cedict_line(line)
                if not parsed:
                    continue
                
                traditional, simplified, pinyin, definitions = parsed
                # Create key with lowercase pinyin for case-insensitive lookup
                key = (traditional, simplified, pinyin.lower())
                # Store the definitions joined
                handedict_map[key] = ' / '.join(definitions)

        self.stdout.write(f"  Loaded {len(handedict_map)} Handedict entries")

        # Now iterate through CEDictionary and look up matches
        count = 0
        skipped = 0
        not_found = 0

        for cedict in CEDictionary.objects.all():
            try:
                # Try to find matching Handedict entry
                # Create lookup key with lowercase pronunciation for case-insensitive matching
                lookup_key = (cedict.traditional, cedict.simplified, cedict.pronunciation.lower())
                
                if lookup_key in handedict_map:
                    definitions_str = handedict_map[lookup_key]
                    CEDefinition.objects.get_or_create(
                        cedict=cedict,
                        language='de',
                        defaults={'definitions': definitions_str}
                    )
                    count += 1
                else:
                    not_found += 1

                if (count + not_found) % 5000 == 0:
                    self.stdout.write(f"  Processed {count + not_found} entries... ({count} matched)")

            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Error processing {cedict}: {e}"
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions "
                f"(not found: {not_found}, skipped: {skipped})"
            )
        )

    def handle(self, *args, **options):
        language = options['language']
        clear = options['clear']

        if clear:
            self.stdout.write("Clearing existing CEDefinition entries...")
            count = CEDefinition.objects.all().delete()[0]
            self.stdout.write(
                self.style.SUCCESS(f"Deleted {count} existing entries")
            )

        with transaction.atomic():
            if language in ['en', 'all']:
                self.populate_english()
            
            if language in ['de', 'all']:
                self.populate_german()

        self.stdout.write(
            self.style.SUCCESS("\n✓ CEDefinition population complete!")
        )
