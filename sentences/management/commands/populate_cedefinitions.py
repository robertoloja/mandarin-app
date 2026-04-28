"""
Management command to populate CEDefinition table from CEDICT and Handedict.

This command:
1. Creates CEDefinition entries for English (from CEDictionary.definitions)
2. Creates CEDefinition entries for German (from Handedict)
"""

import os
import re
import string
from django.core.management.base import BaseCommand
from django.db import transaction

from sentences.models import CEDictionary, CEDefinition


def is_punctuation(character: str) -> bool:
    """Check if character is punctuation (Chinese or ASCII)."""
    punctuation = ",，。！？：；、""''（）《》【】〔〕……—～·\u3000"
    return character in punctuation or character in string.punctuation


def strip_punctuation(text: str) -> str:
    """Remove all punctuation from text."""
    return "".join([x for x in text if not is_punctuation(x)])


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
        already_exists = 0

        # Get or create English definitions for existing CEDictionary entries
        for cedict in CEDictionary.objects.all():
            try:
                obj, created = CEDefinition.objects.get_or_create(
                    cedict=cedict,
                    language='en',
                    defaults={'definitions': cedict.definitions}
                )
                if created:
                    count += 1
                else:
                    already_exists += 1
                
                if (count + already_exists) % 10000 == 0:
                    self.stdout.write(f"  Processed {count + already_exists} entries...")
                    
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
                f"✓ Populated {count} English definitions "
                f"(already exists: {already_exists}, skipped: {skipped})"
            )
        )

    def populate_german(self):
        """Populate German definitions from Handedict with aggressive fallback matching.
        
        Uses progressive fallback strategy with increasing flexibility:
        1. **Exact**: (traditional, simplified, pinyin) - exact match on all 3
        2. **Character**: (traditional, simplified) - ignores pronunciation
        3. **Traditional-only**: (traditional,) - fallback for rare words
        4. **Simplified-only**: (simplified,) - for simplified-heavy entries
        5. **Pronunciation-based**: Any entry with matching pinyin
        
        Logs all inexact matches and unmatched words to text files for review.
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

        # Build lookup dictionaries from Handedict at different granularity levels
        handedict_exact = {}      # (trad, simp, pinyin) - exact match
        handedict_chars = {}      # (trad, simp) - character-only match (stores list)
        handedict_trad_only = {}  # (trad,) - traditional only (stores list)
        handedict_simp_only = {}  # (simp,) - simplified only (stores list)
        handedict_pinyin = {}     # (pinyin,) - pronunciation only (stores list)
        
        with open(handedict_path, 'r', encoding='utf-8') as f:
            for line in f:
                parsed = self.parse_cedict_line(line)
                if not parsed:
                    continue
                
                traditional, simplified, pinyin, definitions = parsed
                definitions_str = ' / '.join(definitions)
                
                # Exact match key (case-insensitive pinyin)
                exact_key = (traditional, simplified, pinyin.lower())
                handedict_exact[exact_key] = (definitions_str, pinyin, traditional, simplified)
                
                # Character match key (no pinyin)
                char_key = (traditional, simplified)
                if char_key not in handedict_chars:
                    handedict_chars[char_key] = []
                handedict_chars[char_key].append((definitions_str, pinyin, traditional, simplified))
                
                # Traditional-only match key
                trad_key = (traditional,)
                if trad_key not in handedict_trad_only:
                    handedict_trad_only[trad_key] = []
                handedict_trad_only[trad_key].append((definitions_str, pinyin, traditional, simplified))
                
                # Simplified-only match key
                simp_key = (simplified,)
                if simp_key not in handedict_simp_only:
                    handedict_simp_only[simp_key] = []
                handedict_simp_only[simp_key].append((definitions_str, pinyin, traditional, simplified))
                
                # Pronunciation-only match key
                pinyin_key = (pinyin.lower(),)
                if pinyin_key not in handedict_pinyin:
                    handedict_pinyin[pinyin_key] = []
                handedict_pinyin[pinyin_key].append((definitions_str, pinyin, traditional, simplified))

        self.stdout.write(
            f"  Loaded {len(handedict_exact)} Handedict entries "
            f"({len(handedict_chars)} unique char pairs)"
        )

        # Open files for logging inexact matches and unmatched words
        inexact_matches_file = open('inexact_matches.txt', 'w', encoding='utf-8')
        unmatched_words_file = open('unmatched_words.txt', 'w', encoding='utf-8')
        
        # Write headers (only once at the start of the file)
        inexact_matches_file.write(
            "INEXACT MATCHES - Words matched with fallback strategies\n"
            "Columns: CEDICT_HANZI | TRADITIONAL | SIMPLIFIED | PINYIN | ENGLISH | GERMAN_DEFINITION | MATCH_TYPE | SOURCE\n"
            "-" * 150 + "\n"
        )
        unmatched_words_file.write(
            "UNMATCHED WORDS - No German definition found in Handedict\n"
            "Columns: CEDICT_HANZI | TRADITIONAL | SIMPLIFIED | PINYIN | ENGLISH\n"
            "-" * 120 + "\n"
        )

        # Iterate through CEDictionary and look up matches with fallback
        count = 0
        count_exact = 0
        count_char = 0
        count_trad = 0
        count_simp = 0
        count_pinyin = 0
        skipped = 0
        not_found = 0

        for cedict in CEDictionary.objects.all():
            try:
                # Check if German definition already exists
                if CEDefinition.objects.filter(cedict=cedict, language='de').exists():
                    continue
                
                definitions_str = None
                match_type = None
                source_info = None
                
                # Level 1: Try exact 3-tuple match (traditional, simplified, pinyin)
                exact_key = (cedict.traditional, cedict.simplified, cedict.pronunciation.lower())
                if exact_key in handedict_exact:
                    definitions_str, _, _, _ = handedict_exact[exact_key]
                    count_exact += 1
                    match_type = "exact"
                
                # Level 2: If not found, try character-only match (traditional, simplified)
                if not definitions_str:
                    char_key = (cedict.traditional, cedict.simplified)
                    if char_key in handedict_chars:
                        definitions_str, source_pinyin, source_trad, source_simp = handedict_chars[char_key][0]
                        count_char += 1
                        match_type = "character"
                        source_info = f"{source_trad}/{source_simp}[{source_pinyin}]"
                
                # Level 3: If still not found, try traditional-only match
                if not definitions_str:
                    trad_key = (cedict.traditional,)
                    if trad_key in handedict_trad_only:
                        definitions_str, source_pinyin, source_trad, source_simp = handedict_trad_only[trad_key][0]
                        count_trad += 1
                        match_type = "traditional-only"
                        source_info = f"{source_trad}/{source_simp}[{source_pinyin}]"
                
                # Level 4: Try simplified-only match
                if not definitions_str:
                    simp_key = (cedict.simplified,)
                    if simp_key in handedict_simp_only:
                        definitions_str, source_pinyin, source_trad, source_simp = handedict_simp_only[simp_key][0]
                        count_simp += 1
                        match_type = "simplified-only"
                        source_info = f"{source_trad}/{source_simp}[{source_pinyin}]"
                
                # Level 5: Try pronunciation-only match (most aggressive fallback)
                if not definitions_str:
                    pinyin_key = (cedict.pronunciation.lower(),)
                    if pinyin_key in handedict_pinyin:
                        definitions_str, source_pinyin, source_trad, source_simp = handedict_pinyin[pinyin_key][0]
                        count_pinyin += 1
                        match_type = "pronunciation-only"
                        source_info = f"{source_trad}/{source_simp}[{source_pinyin}]"
                
                # Create the definition if found
                if definitions_str:
                    CEDefinition.objects.create(
                        cedict=cedict,
                        language='de',
                        definitions=definitions_str
                    )
                    count += 1
                    
                    # Log inexact matches (non-exact) to file
                    if match_type != "exact":
                        inexact_matches_file.write(
                            f"{cedict.traditional} | {cedict.traditional} | {cedict.simplified} | "
                            f"{cedict.pronunciation} | {cedict.definitions} | {definitions_str} | "
                            f"{match_type} (from {source_info})\n"
                        )
                else:
                    not_found += 1
                    # Log unmatched word to file
                    unmatched_words_file.write(
                        f"{cedict.traditional} | {cedict.traditional} | {cedict.simplified} | "
                        f"{cedict.pronunciation} | {cedict.definitions}\n"
                    )

                if (count + not_found) % 10000 == 0:
                    self.stdout.write(
                        f"  Processed {count + not_found} entries... "
                        f"(matched: {count} | exact: {count_exact}, char: {count_char}, trad: {count_trad}, simp: {count_simp}, pinyin: {count_pinyin})"
                    )

            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Error processing {cedict}: {e}"
                        )
                    )

        # Close log files
        inexact_matches_file.close()
        unmatched_words_file.close()

        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions:\n"
                f"  - Exact matches (trad+simp+pinyin): {count_exact}\n"
                f"  - Character matches (trad+simp): {count_char}\n"
                f"  - Traditional-only matches: {count_trad}\n"
                f"  - Simplified-only matches: {count_simp}\n"
                f"  - Pronunciation-only matches: {count_pinyin}\n"
                f"  - Not found: {not_found}\n"
                f"  - Skipped errors: {skipped}\n"
                f"\n  📄 Inexact matches logged to: inexact_matches.txt\n"
                f"  📄 Unmatched words logged to: unmatched_words.txt"
            )
        )

    def populate_german_variants(self):
        """Populate German definitions for variant entries by translating English descriptions.
        
        For entries like "old variant of X", "variant of X", "old form of X", etc.,
        create German equivalents by translating the description.
        
        This ensures all variant/form entries have at least a descriptive German translation.
        """
        self.stdout.write("Populating German variant definitions...")
        
        # Translation mappings: (English regex pattern, German template)
        # Template uses {0} for the reference text
        variant_patterns = [
            (r'old variant of (.+)', 'alte Variante von {0}'),
            (r'variant of (.+)', 'Variante von {0}'),
            (r'old form of (.+)', 'alte Form von {0}'),
            (r'form of (.+)', 'Form von {0}'),
            (r'nonstandard form of (.+)', 'nichtstandard Form von {0}'),
            (r'simplified form of (.+)', 'vereinfachte Form von {0}'),
            (r'traditional form of (.+)', 'traditionelle Form von {0}'),
        ]
        
        count = 0
        skipped = 0
        
        for cedict in CEDictionary.objects.all():
            try:
                # Skip if German definition already exists
                if CEDefinition.objects.filter(cedict=cedict, language='de').exists():
                    continue
                
                english_def = cedict.definitions
                german_def = None
                
                # Try to match and translate variant patterns
                for pattern, german_template in variant_patterns:
                    match = re.match(pattern, english_def)
                    if match:
                        reference = match.group(1)
                        german_def = german_template.format(reference)
                        break
                
                # Create the German definition if we found a translation
                if german_def:
                    CEDefinition.objects.create(
                        cedict=cedict,
                        language='de',
                        definitions=german_def
                    )
                    count += 1
            
            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing variant {cedict}: {e}")
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German variant definitions "
                f"(skipped: {skipped})"
            )
        )

    def populate_german_abbreviations(self):
        """Expand abbreviations and inherit German definitions from expanded terms.
        
        For entries like "abbr. for 上海合作組織", expand to the full term and 
        look up its German definition in CEDictionary/CEDefinition.
        
        This catches modern abbreviations that may not be in HanDeDict directly.
        """
        self.stdout.write("Populating German definitions via abbreviation expansion...")
        
        # Regex to detect abbreviation patterns
        abbr_pattern = r'abbr\.\s+for\s+(.+?)(?:\s*[,/;]|$)'
        
        count = 0
        skipped = 0
        
        for cedict in CEDictionary.objects.all():
            try:
                # Skip if German definition already exists
                if CEDefinition.objects.filter(cedict=cedict, language='de').exists():
                    continue
                
                english_def = cedict.definitions
                
                # Try to match abbreviation pattern
                match = re.search(abbr_pattern, english_def, re.IGNORECASE)
                if match:
                    expanded_term = match.group(1).strip()
                    
                    # Try to find the expanded term in CEDictionary
                    try:
                        # Look for exact match in traditional or simplified
                        expanded_cedicts = CEDictionary.objects.filter(
                            traditional=expanded_term
                        ) | CEDictionary.objects.filter(
                            simplified=expanded_term
                        )
                        
                        for expanded_cedict in expanded_cedicts:
                            # Try to get German definition of expanded term
                            expanded_german = CEDefinition.objects.filter(
                                cedict=expanded_cedict,
                                language='de'
                            ).first()
                            
                            if expanded_german:
                                # Use expanded term's German definition
                                CEDefinition.objects.create(
                                    cedict=cedict,
                                    language='de',
                                    definitions=expanded_german.definitions
                                )
                                count += 1
                                break
                    except Exception as inner_e:
                        pass  # Silently skip if expanded term lookup fails
            
            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing abbreviation {cedict}: {e}")
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions via abbreviation expansion "
                f"(skipped: {skipped})"
            )
        )

    def populate_german_variant_redirects(self):
        """Redirect variant definitions to their parent term's German definition.
        
        For entries like "variant of 叮嚀", "see 上岸", "form of X", look up the 
        parent/referenced term and inherit its German definition.
        
        This is more aggressive than populate_german_variants which just translates 
        the description—this actually looks up the parent term's German translation.
        """
        self.stdout.write("Populating German definitions via variant/form redirects...")
        
        # Patterns to detect references to other entries
        reference_patterns = [
            (r'(?:old\s+)?variant(?:\s+of)?\s+(.+?)(?:\s*[,/;]|$)', 'variant'),
            (r'(?:old\s+)?form(?:\s+of)?\s+(.+?)(?:\s*[,/;]|$)', 'form'),
            (r'see\s+(.+?)(?:\s*[,/;]|$)', 'see'),
            (r'same\s+as\s+(.+?)(?:\s*[,/;]|$)', 'same_as'),
        ]
        
        count = 0
        redirected = 0
        skipped = 0
        
        for cedict in CEDictionary.objects.all():
            try:
                # Skip if German definition already exists
                if CEDefinition.objects.filter(cedict=cedict, language='de').exists():
                    continue
                
                english_def = cedict.definitions
                referenced_term = None
                
                # Try to match reference patterns
                for pattern, pattern_type in reference_patterns:
                    match = re.search(pattern, english_def, re.IGNORECASE)
                    if match:
                        referenced_term = match.group(1).strip()
                        break
                
                if referenced_term:
                    # Extract just the hanzi part (remove pinyin info if present)
                    # e.g., "叮嚀 ding1 ning2" -> "叮嚀"
                    hanzi_only = referenced_term.split()[0] if referenced_term else None
                    
                    if hanzi_only:
                        try:
                            # Look for the referenced term in CEDictionary
                            ref_cedicts = CEDictionary.objects.filter(
                                traditional=hanzi_only
                            ) | CEDictionary.objects.filter(
                                simplified=hanzi_only
                            )
                            
                            for ref_cedict in ref_cedicts:
                                # Try to get German definition of referenced term
                                ref_german = CEDefinition.objects.filter(
                                    cedict=ref_cedict,
                                    language='de'
                                ).first()
                                
                                if ref_german:
                                    # Use referenced term's German definition
                                    CEDefinition.objects.create(
                                        cedict=cedict,
                                        language='de',
                                        definitions=ref_german.definitions
                                    )
                                    redirected += 1
                                    count += 1
                                    break
                        except Exception as inner_e:
                            pass  # Silently skip if reference lookup fails
            
            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing redirect {cedict}: {e}")
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions via variant redirects "
                f"({redirected} redirected, {skipped} skipped)"
            )
        )

    def populate_german_punctuation_stripped(self):
        """Match entries by stripping punctuation from HanDeDict entries.
        
        HanDeDict entries like "瓜田不納履，李下不整冠" get stored in CEDictionary 
        as "瓜田不納履李下不整冠" (punctuation stripped).
        
        This method takes all HanDeDict entries, strips their punctuation, and 
        looks for matches in CEDictionary to inherit their German definitions.
        
        This is especially effective for chengyu (Chinese idioms) which often 
        contain punctuation.
        """
        self.stdout.write("Populating German definitions via punctuation-stripped matching...")
        
        handedict_path = os.path.join(
            os.path.dirname(__file__),
            '../../../static/handedict.u8'
        )

        if not os.path.exists(handedict_path):
            self.stdout.write(
                self.style.WARNING(f"Handedict file not found at {handedict_path}, skipping")
            )
            return

        count = 0
        skipped = 0
        
        # Build a map of stripped HanDeDict entries to their German definitions
        handedict_stripped = {}  # stripped_trad -> (german_def, original_trad, original_simp)
        
        with open(handedict_path, 'r', encoding='utf-8') as f:
            for line in f:
                parsed = self.parse_cedict_line(line)
                if not parsed:
                    continue
                
                traditional, simplified, pinyin, definitions = parsed
                definitions_str = ' / '.join(definitions)
                
                # Strip punctuation and create lookup key
                stripped_trad = strip_punctuation(traditional)
                stripped_simp = strip_punctuation(simplified)
                
                # Only keep if stripping actually changed something (has punctuation)
                if stripped_trad != traditional or stripped_simp != simplified:
                    # Use stripped traditional as key (prefer traditional for lookup)
                    if stripped_trad not in handedict_stripped:
                        handedict_stripped[stripped_trad] = (definitions_str, traditional, simplified)
        
        self.stdout.write(
            f"  Found {len(handedict_stripped)} HanDeDict entries with punctuation"
        )
        
        # Get all CEDict IDs that already have German definitions (batch lookup)
        existing_cedict_ids = set(
            CEDefinition.objects.filter(language='de').values_list('cedict_id', flat=True)
        )
        self.stdout.write(f"  Already have German defs for {len(existing_cedict_ids)} entries")
        
        # Now look for matches in CEDictionary
        cedicts_to_process = CEDictionary.objects.exclude(id__in=existing_cedict_ids)
        total_to_check = cedicts_to_process.count()
        self.stdout.write(f"  Checking {total_to_check} CEDict entries for punctuation matches...")
        
        for i, cedict in enumerate(cedicts_to_process):
            if i % 10000 == 0 and i > 0:
                self.stdout.write(f"  Processed {i}/{total_to_check}...")
                
            try:
                # Try to find stripped version in HanDeDict
                if cedict.traditional in handedict_stripped:
                    definitions_str, orig_trad, orig_simp = handedict_stripped[cedict.traditional]
                    
                    CEDefinition.objects.create(
                        cedict=cedict,
                        language='de',
                        definitions=definitions_str
                    )
                    count += 1
            
            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing {cedict}: {e}")
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions via punctuation-stripped matching "
                f"(skipped: {skipped})"
            )
        )

    def populate_german_prefix_templates(self):
        """Generate German definitions for compound words using prefix templates.
        
        Detects systematic patterns like:
        - 代X (substitute/representative): "Substitut für X", "an Stelle von X"
        - 令X (imperial/honorific): Specific honorific translations
        - 以X (using/via X): "mittels X", "via X"
        - 二X, 三X, etc. (numeric compounds): Numerical prefixes
        
        This catches formulaic compounds that follow predictable patterns.
        """
        self.stdout.write("Populating German definitions via prefix templates...")
        
        # Define prefix patterns and their German translations
        prefix_patterns = {
            # Pattern: (prefix_char, english_suffix_pattern, german_template)
            # german_template uses {0} for the referenced term
            
            # "代X" patterns (substitute/on behalf of)
            ('代', r'to .+ on behalf of|to do .+ in (place|stead) of|on sb\'s behalf', 'anstelle von; Vertretung für'),
            ('代', r'to .+ as substitute', 'Ersatz für'),
            ('代', r'generation after generation', 'Generation um Generation'),
            ('代', r'offspring|descendants', 'Nachkommen'),
            
            # Honorific patterns (令X)
            ('令', r'your .+ (honorific|esteemed)', 'Ihr geschätzter'),
            ('令', r'your mother', 'Ihre Mutter (ehrenvoll)'),
            ('令', r'your father', 'Ihr Vater (ehrenvoll)'),
            ('令', r'your (son|daughter)', 'Ihr (Sohn|Tochter) (ehrenvoll)'),
            
            # Chemistry/Science patterns (for XXX as modifiers)
            ('二', r'divalent|bivalent', 'zweiwertig'),
            ('二', r'second.*degree', 'zweiter Grad'),
            ('三', r'trisomy', 'Trisomie'),
            ('三', r'triple.*bond', 'Dreifachbindung'),
            ('三', r'triple heater.*TCM', 'Dreifacher Wärmer (TCM)'),
        }
        
        count = 0
        matched = {}
        
        for cedict in CEDictionary.objects.all():
            try:
                # Skip if German definition already exists
                if CEDefinition.objects.filter(cedict=cedict, language='de').exists():
                    continue
                
                first_char = cedict.traditional[0] if cedict.traditional else None
                english_def = cedict.definitions.lower()
                german_def = None
                
                # Try to match prefix patterns
                for prefix, pattern, template in prefix_patterns:
                    if first_char == prefix and re.search(pattern, english_def):
                        german_def = template
                        matched_key = f"{first_char}|{pattern}"
                        matched[matched_key] = matched.get(matched_key, 0) + 1
                        break
                
                # Create the definition if found
                if german_def:
                    CEDefinition.objects.create(
                        cedict=cedict,
                        language='de',
                        definitions=german_def
                    )
                    count += 1
            
            except Exception as e:
                if count <= 10:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing prefix template {cedict}: {e}")
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions via prefix templates "
                f"(patterns matched: {len(matched)})"
            )
        )

    def populate_german_number_patterns(self):
        """Generate German definitions for numeric compound patterns.
        
        Detects patterns like:
        - "一X" (one/first...): "erste/s/r X"
        - "二X" (second/two...): "zweite/s/r X" 
        - "五X" (five...): "fünf..."
        - "十X" (ten...): "zehn..."
        
        Matches entries where English definitions have numeric patterns
        like "second", "third", "first", "fifth", etc.
        """
        self.stdout.write("Populating German definitions via numeric patterns...")
        
        # Numeric mappings: English ordinal/cardinal -> German
        number_patterns = {
            'first': 'erste',
            'second': 'zweite',
            'third': 'dritte',
            'fourth': 'vierte',
            'fifth': 'fünfte',
            'sixth': 'sechste',
            'seventh': 'siebente',
            'eighth': 'achte',
            'ninth': 'neunte',
            'tenth': 'zehnte',
        }
        
        # Chinese numeric chars to German
        chinese_numbers = {
            '一': 'eins',
            '二': 'zwei',
            '三': 'drei',
            '四': 'vier',
            '五': 'fünf',
            '六': 'sechs',
            '七': 'sieben',
            '八': 'acht',
            '九': 'neun',
            '十': 'zehn',
        }
        
        count = 0
        skipped = 0
        
        for cedict in CEDictionary.objects.all():
            try:
                # Skip if German definition already exists
                if CEDefinition.objects.filter(cedict=cedict, language='de').exists():
                    continue
                
                english_def = cedict.definitions.lower()
                first_char = cedict.traditional[0] if cedict.traditional else None
                german_def = None
                
                # Try numeric ordinal patterns
                for english_num, german_num in number_patterns.items():
                    if english_num in english_def and first_char in chinese_numbers:
                        # For entries like "二八" (sixteen) with definition "sixteen"
                        # Don't use numeric translation if it's a pure number
                        if re.match(r'^\d+$', cedict.definitions):
                            continue
                        
                        # For descriptive definitions mentioning ordinals
                        german_def = english_def.replace(english_num, german_num)[:60]
                        break
                
                # Create the definition if found and reasonable length
                if german_def and len(german_def) > 5:
                    CEDefinition.objects.create(
                        cedict=cedict,
                        language='de',
                        definitions=german_def
                    )
                    count += 1
            
            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing numeric pattern {cedict}: {e}")
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions via numeric patterns "
                f"(skipped: {skipped})"
            )
        )

    def populate_german_english_translation_bridge(self):
        """Use English definitions as German when no HanDeDict entry exists.
        
        For entries that are very unlikely to have German HanDeDict equivalents
        (e.g., proper nouns, modern neologisms, highly technical terms),
        use the English definition as-is with a note that it's translated from English.
        
        This acts as a fallback for entries with unique/specialized meanings.
        """
        self.stdout.write("Populating German definitions via English bridge...")
        
        count = 0
        skipped = 0
        
        # Define criteria for using English as fallback
        english_fallback_patterns = [
            r'^\(Tw\)',  # Taiwanese-specific
            r'^\(slang\)',  # Slang terms
            r'^\(coll\)',  # Colloquial
            r'^\(Internet slang\)',  # Internet neologisms
            r'^\(neologism',  # Modern coinages
            r'^\(in .*?\)',  # Specific domain terms
        ]
        
        for cedict in CEDictionary.objects.all():
            try:
                # Skip if German definition already exists
                if CEDefinition.objects.filter(cedict=cedict, language='de').exists():
                    continue
                
                # Only apply to entries without good HanDeDict matches
                english_def = cedict.definitions
                
                # Check if entry matches fallback criteria
                should_fallback = any(re.match(pattern, english_def) for pattern in english_fallback_patterns)
                
                if should_fallback and len(english_def) < 150:
                    # Use English definition as German (with note)
                    german_def = f"[en] {english_def}"
                    
                    CEDefinition.objects.create(
                        cedict=cedict,
                        language='de',
                        definitions=german_def
                    )
                    count += 1
            
            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    self.stdout.write(
                        self.style.WARNING(f"Error processing English fallback {cedict}: {e}")
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✓ Populated {count} German definitions via English bridge "
                f"(skipped: {skipped})"
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

        # Run each strategy in its own transaction so failures don't roll back everything
        if language in ['en', 'all']:
            with transaction.atomic():
                self.populate_english()
        
        if language in ['de', 'all']:
            with transaction.atomic():
                self.populate_german()
            
            with transaction.atomic():
                self.populate_german_variants()
            
            with transaction.atomic():
                self.populate_german_abbreviations()
            
            with transaction.atomic():
                self.populate_german_variant_redirects()
            
            with transaction.atomic():
                self.populate_german_punctuation_stripped()
            
            # New strategies
            with transaction.atomic():
                self.populate_german_prefix_templates()
            
            with transaction.atomic():
                self.populate_german_number_patterns()
            
            with transaction.atomic():
                self.populate_german_english_translation_bridge()

        self.stdout.write(
            self.style.SUCCESS("\n✓ CEDefinition population complete!")
        )
