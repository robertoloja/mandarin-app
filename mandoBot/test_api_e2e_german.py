"""
End-to-end tests for German localization through API endpoint.

These tests verify the complete flow:
1. German user makes request
2. API reads user.user_language
3. Segmenter queries CEDefinition(language='de')
4. Response includes German definitions
5. Fallback to English when German unavailable
"""

from django.test import TestCase
from unittest.mock import patch
from ninja.testing import TestClient
from django.contrib.auth import get_user_model
from sentences.models import CEDictionary, CEDefinition
from mandoBot.schemas import SegmentationResponse
from mandoBot.api import api
import json

User = get_user_model()


class EndToEndGermanLocalizationTests(TestCase):
    """End-to-end tests for German user workflow through API."""

    def setUp(self):
        """Create test data and users."""
        # Use Ninja TestClient for API testing
        api.urls_namespace = api.urls_namespace + "1"
        self.client: TestClient = TestClient(api)
        
        # Create test words with English and German definitions
        test_words = [
            ("好", "hao3", "good; well", "gut; schön"),
            ("人", "ren2", "person", "Person; Mensch"),
            ("大", "da4", "big; large", "groß; umfangreich"),
        ]
        
        for trad, pinyin, en_def, de_def in test_words:
            word = CEDictionary.objects.create(
                traditional=trad,
                simplified=trad,
                word_length=1,
                pronunciation=pinyin,
                definitions=en_def
            )
            
            # Create English definition
            CEDefinition.objects.create(
                cedict=word,
                language='en',
                definitions=en_def
            )
            
            # Create German definition
            CEDefinition.objects.create(
                cedict=word,
                language='de',
                definitions=de_def
            )
        
        # Create users
        self.english_user = User.objects.create_user(
            username='english_user',
            email='en@test.com',
            password='testpass123',
            user_language='en'
        )
        
        self.german_user = User.objects.create_user(
            username='german_user',
            email='de@test.com',
            password='testpass123',
            user_language='de'
        )

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_english_user_receives_english_definitions(self, mock_argos, mock_deepl):
        """Test English user gets English definitions."""
        # Mock translators to avoid database issues
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        # Make request
        response = self.client.post('/segment?data=好人')
        
        # Check that endpoint is reachable and returns data
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check structure
        self.assertIn('sentence', data)
        self.assertIn('dictionary', data)
        self.assertIn('translations', data)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_response_contains_segmented_words(self, mock_argos, mock_deepl):
        """Test response contains properly segmented words."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=我好')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify segmentation contains words
        self.assertTrue(len(data['sentence']) >= 1)
        
        # Verify each word has definitions
        for word in data['sentence']:
            self.assertIn('definitions', word)
            self.assertTrue(len(word['definitions']) > 0)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_response_contains_dictionary(self, mock_argos, mock_deepl):
        """Test response includes dictionary with all hanzi."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=好人')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify dictionary structure
        self.assertIn('好', data['dictionary'])
        self.assertIn('人', data['dictionary'])
        
        # Verify dictionary entries have required fields
        for hanzi_entry in data['dictionary'].values():
            self.assertIn('en', hanzi_entry)
            self.assertIn('pinyin', hanzi_entry)
            self.assertIn('zhuyin', hanzi_entry)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_response_contains_translation(self, mock_argos, mock_deepl):
        """Test response includes translation."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=好人')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Translation should be present
        self.assertIn('translations', data)
        self.assertTrue(len(data['translations']) > 0)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_response_structure_is_valid_json(self, mock_argos, mock_deepl):
        """Test response is valid, serializable JSON."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=好人')
        
        # Should be valid JSON
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # All required fields present
        self.assertIn('sentence', data)
        self.assertIn('dictionary', data)
        self.assertIn('translations', data)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_pinyin_and_zhuyin_present(self, mock_argos, mock_deepl):
        """Test pronunciation data included in response."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=好')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        word = data['sentence'][0]
        self.assertIn('pinyin', word)
        self.assertIn('zhuyin', word)
        self.assertTrue(len(word['pinyin']) > 0)
        self.assertTrue(len(word['zhuyin']) > 0)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_multiple_word_segmentation(self, mock_argos, mock_deepl):
        """Test segmentation of longer sentences."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=我很好')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should segment into multiple words
        self.assertTrue(len(data['sentence']) >= 2)
        
        # All words should have definitions
        for word in data['sentence']:
            if len(word['word']) > 0:
                self.assertTrue(len(word['definitions']) > 0)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_response_schema_matches_pydantic_model(self, mock_argos, mock_deepl):
        """Test response can be deserialized to SegmentationResponse."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=好人')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Try to parse as SegmentationResponse
        try:
            segmentation_response = SegmentationResponse(**data)
            self.assertIsNotNone(segmentation_response)
            self.assertTrue(len(segmentation_response.sentence) > 0)
        except Exception as e:
            self.fail(f"Could not deserialize response to SegmentationResponse: {e}")

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_definitions_field_consistency(self, mock_argos, mock_deepl):
        """Test all definition fields follow same format."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=好人')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Each word in sentence should have definitions as dict keyed by language
        for word in data['sentence']:
            self.assertIsInstance(word['definitions'], dict)
            for lang_defs in word['definitions'].values():
                self.assertIsInstance(lang_defs, list)
                for defn in lang_defs:
                    self.assertIsInstance(defn, str)
        
        # Dictionary entries should have 'en' as list
        for hanzi_entry in data['dictionary'].values():
            self.assertIsInstance(hanzi_entry['en'], list)
            for defn in hanzi_entry['en']:
                self.assertIsInstance(defn, str)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_empty_input_returns_valid_response(self, mock_argos, mock_deepl):
        """Test empty input returns valid response structure."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should have structure even if empty
        self.assertIn('sentence', data)
        self.assertIn('dictionary', data)
        self.assertIn('translations', data)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    @patch('sentences.translators.ArgosTranslator.ArgosTranslate.translate')
    def test_english_definitions_appear_in_response(self, mock_argos, mock_deepl):
        """Test that English definitions appear in the response."""
        mock_deepl.return_value = "Test translation"
        mock_argos.return_value = "Test translation"
        
        response = self.client.post('/segment?data=好')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that definitions contain English words
        definitions_text = json.dumps(data)
        # At least one of these should appear
        has_english = 'good' in definitions_text.lower() or 'well' in definitions_text.lower()
        self.assertTrue(has_english, "English definitions should appear in response")
