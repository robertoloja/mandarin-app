"""
Tests for anonymous user language preference support.

This ensures that both authenticated and anonymous users can get
language-specific definitions:
- Authenticated users: Use stored user_language preference
- Anonymous users: Pass language preference via query parameter
"""
from django.test import TestCase
from unittest.mock import patch
from ninja.testing import TestClient
from mandoBot.api import api


class AnonymousUserLanguagePreferenceTests(TestCase):
    """Test language preference handling for anonymous users."""

    def setUp(self):
        """Set up unique test client for isolation."""
        api.urls_namespace = api.urls_namespace + "anonymous_tests"
        self.client: TestClient = TestClient(api)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_anonymous_user_with_german_language_parameter(self, mock_argos, mock_deepl):
        """Test anonymous user can request German definitions via query parameter."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"

        # Call endpoint with language parameter
        response = self.client.post('/segment?data=好&language=de')

        # Should succeed and return segmented response
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should have response structure
        self.assertIn('sentence', data)
        self.assertIn('dictionary', data)
        self.assertIn('translations', data)

        # Segmentation should work
        self.assertTrue(len(data['sentence']) > 0)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_anonymous_user_defaults_to_english(self, mock_argos, mock_deepl):
        """Test anonymous user without language parameter defaults to English."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"

        # Call endpoint WITHOUT language parameter
        response = self.client.post('/segment?data=好')

        # Should succeed
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should have valid response structure
        self.assertIn('sentence', data)
        self.assertIn('dictionary', data)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_anonymous_user_english_language_parameter(self, mock_argos, mock_deepl):
        """Test anonymous user can explicitly request English definitions."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"

        # Explicitly pass language=en
        response = self.client.post('/segment?data=好&language=en')

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should return valid response
        self.assertIn('sentence', data)
        self.assertTrue(len(data['sentence']) > 0)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_empty_input_with_language_parameter(self, mock_argos, mock_deepl):
        """Test empty input with language parameter is handled gracefully."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"

        response = self.client.post('/segment?data=&language=de')

        # Should still return 200 with empty response
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertIn('sentence', data)


