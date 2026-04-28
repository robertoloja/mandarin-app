"""
Production database verification script.

This management command verifies that the CEDefinition population was successful
by checking the production database (not test database).

Usage:
    pipenv run python manage.py verify_localization_data
"""

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count
from sentences.models import CEDictionary, CEDefinition


class Command(BaseCommand):
    help = "Verify that CEDefinition population was successful in production database"

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed statistics'
        )

    def handle(self, *args, **options):
        verbose = options.get('verbose', False)
        
        self.stdout.write("\n" + "="*70)
        self.stdout.write("PRODUCTION DATABASE VERIFICATION - German Localization")
        self.stdout.write("="*70 + "\n")
        
        # Check CEDictionary count
        cedict_total = CEDictionary.objects.count()
        self.stdout.write(f"CEDictionary entries: {cedict_total:,}")
        
        # Check CEDefinition counts by language
        en_count = CEDefinition.objects.filter(language='en').count()
        de_count = CEDefinition.objects.filter(language='de').count()
        
        self.stdout.write(f"English definitions:  {en_count:,}")
        self.stdout.write(f"German definitions:   {de_count:,}\n")
        
        # Verify English coverage
        en_coverage = (en_count / cedict_total * 100) if cedict_total > 0 else 0
        self.stdout.write(f"English coverage: {en_coverage:.1f}%")
        
        if en_coverage < 90:
            self.stdout.write(
                self.style.WARNING(
                    f"⚠ Warning: English coverage below expected (expected >95%)"
                )
            )
        elif en_coverage >= 100:
            self.stdout.write(self.style.SUCCESS("✓ English definitions complete"))
        
        # Verify German coverage
        de_coverage = (de_count / cedict_total * 100) if cedict_total > 0 else 0
        self.stdout.write(f"German coverage: {de_coverage:.1f}%\n")
        
        if de_count < 40000:
            self.stdout.write(
                self.style.WARNING(
                    f"⚠ Warning: German definitions below expected (expected >40,000)"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f"✓ German definitions populated ({de_count:,})")
            )
        
        # Check for duplicates
        total_defs = CEDefinition.objects.count()
        unique_defs = CEDefinition.objects.values('cedict', 'language').distinct().count()
        
        self.stdout.write(f"\nTotal definitions:    {total_defs:,}")
        self.stdout.write(f"Unique (cedict+lang): {unique_defs:,}")
        
        if total_defs != unique_defs:
            self.stdout.write(
                self.style.ERROR(f"✗ Error: Found {total_defs - unique_defs} duplicates!")
            )
        else:
            self.stdout.write(self.style.SUCCESS("✓ No duplicates found"))
        
        # Check language distribution
        if verbose:
            self.stdout.write("\n--- Detailed Language Statistics ---\n")
            
            language_counts = CEDefinition.objects.values('language').annotate(
                count=Count('id')
            ).order_by('language')
            
            for lang_stat in language_counts:
                lang = lang_stat['language']
                count = lang_stat['count']
                pct = (count / total_defs * 100) if total_defs > 0 else 0
                self.stdout.write(f"{lang}: {count:,} ({pct:.1f}%)")
        
        # Verify CEDictionary unchanged
        if verbose:
            self.stdout.write("\n--- CEDictionary Verification ---\n")
            
            # Sample check: verify some English definitions match CEDictionary
            sample = CEDictionary.objects.filter(
                multilingual_definitions__language='en'
            )[:5]
            
            mismatches = 0
            for cedict in sample:
                en_def = CEDefinition.objects.get(
                    cedict=cedict,
                    language='en'
                )
                if en_def.definitions != cedict.definitions:
                    mismatches += 1
                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠ Mismatch found: {cedict}"
                        )
                    )
            
            if mismatches == 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        "✓ CEDictionary unchanged (sample verified)"
                    )
                )
        
        # Summary
        self.stdout.write("\n" + "="*70)
        
        if en_coverage >= 95 and de_count >= 40000 and total_defs == unique_defs:
            self.stdout.write(
                self.style.SUCCESS(
                    "✓ VERIFICATION PASSED - Localization data is valid"
                )
            )
            return 0
        else:
            self.stdout.write(
                self.style.ERROR(
                    "✗ VERIFICATION FAILED - Issues detected"
                )
            )
            return 1
