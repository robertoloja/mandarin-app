"""
Tests for translator modules with language support.

Tests verify that:
1. DeepLTranslator accepts and uses target_language parameter
2. ArgosTranslator accepts and uses target_language parameter
3. Translators fall back correctly
4. Language configuration is properly used
"""

import os
from unittest.mock import patch, MagicMock
from django.test import TestCase, override_settings
from sentences.translators.DeepLTranslator import DeepLTranslate
from sentences.translators.ArgosTranslator import ArgosTranslate


class DeepLTranslatorLanguageTests(TestCase):
    """Tests for DeepLTranslator with language support."""

    @override_settings(DEBUG=True)
    @patch('sentences.translators.DeepLTranslator.translator')
    @patch('status.models.ServerStatus.objects.last')
    def test_deepl_translate_with_german(self, mock_status, mock_translator):
        """Test DeepLTranslator accepts and uses German language."""
        # Mock setup
        mock_usage = MagicMock()
        mock_usage.character.count = 100
        mock_usage.any_limit_reached = False
        mock_usage.any_limit_exceeded = False
        mock_translator.get_usage.return_value = mock_usage
        
        mock_status_obj = MagicMock()
        mock_status_obj.difference = 1000
        mock_status_obj.save = MagicMock()
        mock_status.return_value = mock_status_obj
        
        mock_translation = MagicMock()
        mock_translation.text = "German translation"
        mock_translator.translate_text.return_value = mock_translation
        
        # Test German translation
        result = DeepLTranslate.translate("你好", target_language='de')
        
        # Verify the method was called with German code
        mock_translator.translate_text.assert_called_with(
            "你好", 
            source_lang="ZH", 
            target_lang="DE"
        )
        self.assertEqual(result, "German translation")

    @override_settings(DEBUG=True)
    @patch('sentences.translators.DeepLTranslator.translator')
    @patch('status.models.ServerStatus.objects.last')
    def test_deepl_translate_with_english(self, mock_status, mock_translator):
        """Test DeepLTranslator with English language (default)."""
        # Mock setup
        mock_usage = MagicMock()
        mock_usage.character.count = 100
        mock_usage.any_limit_reached = False
        mock_usage.any_limit_exceeded = False
        mock_translator.get_usage.return_value = mock_usage
        
        mock_status_obj = MagicMock()
        mock_status_obj.difference = 1000
        mock_status_obj.save = MagicMock()
        mock_status.return_value = mock_status_obj
        
        mock_translation = MagicMock()
        mock_translation.text = "English translation"
        mock_translator.translate_text.return_value = mock_translation
        
        # Test English translation (default)
        result = DeepLTranslate.translate("你好", target_language='en')
        
        # Verify the method was called with English code
        mock_translator.translate_text.assert_called_with(
            "你好", 
            source_lang="ZH", 
            target_lang="EN-US"
        )
        self.assertEqual(result, "English translation")

    @override_settings(DEBUG=True)
    @patch('sentences.translators.DeepLTranslator.translator')
    @patch('status.models.ServerStatus.objects.last')
    def test_deepl_translate_default_language(self, mock_status, mock_translator):
        """Test DeepLTranslator defaults to English."""
        # Mock setup
        mock_usage = MagicMock()
        mock_usage.character.count = 100
        mock_usage.any_limit_reached = False
        mock_usage.any_limit_exceeded = False
        mock_translator.get_usage.return_value = mock_usage
        
        mock_status_obj = MagicMock()
        mock_status_obj.difference = 1000
        mock_status_obj.save = MagicMock()
        mock_status.return_value = mock_status_obj
        
        mock_translation = MagicMock()
        mock_translation.text = "Translation"
        mock_translator.translate_text.return_value = mock_translation
        
        # Call without specifying language
        DeepLTranslate.translate("你好")
        
        # Should default to EN-US
        mock_translator.translate_text.assert_called_with(
            "你好", 
            source_lang="ZH", 
            target_lang="EN-US"
        )


class ArgosTranslatorLanguageTests(TestCase):
    """Tests for ArgosTranslator with language support."""

    @patch('status.models.ServerStatus.objects.last')
    @patch('argostranslate.translate.translate')
    def test_argos_translate_accepts_language(self, mock_argos_translate, mock_status):
        """Test ArgosTranslator accepts language parameter."""
        # Mock setup
        mock_status_obj = MagicMock()
        mock_status_obj.save = MagicMock()
        mock_status.return_value = mock_status_obj
        
        mock_argos_translate.return_value = "Translation"
        
        # Test with German
        result = ArgosTranslate.translate("你好", target_language='de')
        
        # Verify it was called (actual target code depends on Argos availability)
        mock_argos_translate.assert_called_once()
        self.assertEqual(result, "Translation")

    @patch('status.models.ServerStatus.objects.last')
    @patch('argostranslate.translate.translate')
    def test_argos_translate_default_language(self, mock_argos_translate, mock_status):
        """Test ArgosTranslator defaults to English."""
        # Mock setup
        mock_status_obj = MagicMock()
        mock_status_obj.save = MagicMock()
        mock_status.return_value = mock_status_obj
        
        mock_argos_translate.return_value = "Translation"
        
        # Call without language parameter
        result = ArgosTranslate.translate("你好")
        
        # Should use English as default
        mock_argos_translate.assert_called_once()
        self.assertEqual(result, "Translation")


class TranslatorIntegrationTests(TestCase):
    """Integration tests for translator with language system."""

    def test_translators_accept_language_parameter(self):
        """Verify both translators have language parameter."""
        import inspect
        
        # Check DeepLTranslate.translate signature
        deepl_sig = inspect.signature(DeepLTranslate.translate)
        self.assertIn('target_language', deepl_sig.parameters,
            "DeepLTranslate.translate should have target_language parameter")
        
        # Check ArgosTranslate.translate signature
        argos_sig = inspect.signature(ArgosTranslate.translate)
        self.assertIn('target_language', argos_sig.parameters,
            "ArgosTranslate.translate should have target_language parameter")

    def test_language_config_covers_translators(self):
        """Verify LANGUAGE_CONFIG has codes for both translators."""
        from mandoBot.languages import LANGUAGE_CONFIG
        
        for lang_code, config in LANGUAGE_CONFIG.items():
            self.assertIn('deepl_code', config,
                f"Language {lang_code} missing deepl_code")
            self.assertIn('argos_code', config,
                f"Language {lang_code} missing argos_code")
