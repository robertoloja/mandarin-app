"""
Tests for the populate_cedefinitions management command.

Tests verify that the command:
1. Accepts language parameters
2. Can clear and repopulate data
3. Is idempotent (running twice produces same results)
"""

from io import StringIO
from django.test import TestCase
from django.core.management import call_command
from sentences.models import CEDictionary, CEDefinition


class PopulateCEDefinitionsCommandTests(TestCase):
    """Tests for populate_cedefinitions management command structure."""

    def setUp(self):
        """Create test CEDictionary entries."""
        CEDictionary.objects.create(
            traditional="好",
            simplified="好",
            word_length=1,
            pronunciation="hao3",
            definitions="good; well; ..."
        )
        CEDictionary.objects.create(
            traditional="人",
            simplified="人",
            word_length=1,
            pronunciation="ren2",
            definitions="person; people; ..."
        )

    def test_command_accepts_language_parameter(self):
        """Test that command accepts --language parameter."""
        out = StringIO()
        err = StringIO()
        
        # Should not raise error
        try:
            call_command('populate_cedefinitions', '--language', 'en', 
                        stdout=out, stderr=err)
            success = True
        except Exception as e:
            success = False
            self.fail(f"Command failed with: {e}")
        
        self.assertTrue(success)

    def test_command_accepts_clear_flag(self):
        """Test that command accepts --clear flag."""
        out = StringIO()
        
        # Should not raise error
        try:
            call_command('populate_cedefinitions', '--language', 'en', 
                        '--clear', stdout=out)
            success = True
        except Exception as e:
            success = False
            self.fail(f"Command failed with: {e}")
        
        self.assertTrue(success)

    def test_command_populates_english(self):
        """Test command populates English definitions."""
        out = StringIO()
        call_command('populate_cedefinitions', '--language', 'en', stdout=out)
        
        # Should have created English definitions for test data
        english_count = CEDefinition.objects.filter(language='en').count()
        self.assertEqual(english_count, 2, "Should populate English for 2 test words")
        
        # Verify they match CEDictionary
        en_def = CEDefinition.objects.get(language='en', cedict__traditional="好")
        self.assertEqual(en_def.definitions, "good; well; ...")

    def test_command_output_format(self):
        """Test command produces expected output."""
        out = StringIO()
        call_command('populate_cedefinitions', '--language', 'en', stdout=out)
        
        output = out.getvalue()
        self.assertIn('Populating English', output)
        self.assertIn('✓ Populated', output)

    def test_command_idempotent_english(self):
        """Test running English population twice doesn't create duplicates."""
        out = StringIO()
        call_command('populate_cedefinitions', '--language', 'en', stdout=out)
        count_first = CEDefinition.objects.filter(language='en').count()
        
        # Run again
        out = StringIO()
        call_command('populate_cedefinitions', '--language', 'en', stdout=out)
        count_second = CEDefinition.objects.filter(language='en').count()
        
        # Should be the same (get_or_create prevents duplicates)
        self.assertEqual(count_first, count_second)

    def test_command_clear_flag_removes_data(self):
        """Test --clear flag removes existing definitions."""
        out = StringIO()
        call_command('populate_cedefinitions', '--language', 'en', stdout=out)
        
        count_before_clear = CEDefinition.objects.count()
        self.assertGreater(count_before_clear, 0)
        
        # Run with --clear
        out = StringIO()
        call_command('populate_cedefinitions', '--language', 'en', 
                    '--clear', stdout=out)
        
        # Should repopulate (count similar)
        count_after_clear = CEDefinition.objects.count()
        self.assertGreater(count_after_clear, 0)


class LanguageConfigTests(TestCase):
    """Tests for language configuration."""

    def test_language_config_exists(self):
        """Test that LANGUAGE_CONFIG is properly set up."""
        from mandoBot.languages import LANGUAGE_CONFIG, SUPPORTED_LANGUAGES
        
        self.assertIn('en', LANGUAGE_CONFIG)
        self.assertIn('de', LANGUAGE_CONFIG)
        
        self.assertIn('en', SUPPORTED_LANGUAGES)
        self.assertIn('de', SUPPORTED_LANGUAGES)

    def test_language_config_has_required_keys(self):
        """Test that language configs have required fields."""
        from mandoBot.languages import LANGUAGE_CONFIG
        
        required_keys = ['deepl_code', 'argos_code', 'name', 'default_translators']
        
        for lang, config in LANGUAGE_CONFIG.items():
            for key in required_keys:
                self.assertIn(key, config,
                    f"Language '{lang}' missing required key '{key}'")

    def test_get_language_config_function(self):
        """Test get_language_config helper function."""
        from mandoBot.languages import get_language_config
        
        en_config = get_language_config('en')
        self.assertEqual(en_config['deepl_code'], 'EN-US')
        
        de_config = get_language_config('de')
        self.assertEqual(de_config['deepl_code'], 'DE')
        
        # Unknown language should default to English
        unknown_config = get_language_config('unknown')
        self.assertEqual(unknown_config['deepl_code'], 'EN-US')

    def test_is_supported_language_function(self):
        """Test is_supported_language helper function."""
        from mandoBot.languages import is_supported_language
        
        self.assertTrue(is_supported_language('en'))
        self.assertTrue(is_supported_language('de'))
        self.assertFalse(is_supported_language('fr'))
        self.assertFalse(is_supported_language('unknown'))
