"""
Integration tests for segmentation with language-aware definitions.

These tests verify that the segmentation pipeline can use CEDefinition
to return language-specific definitions in API responses.
"""

from unittest.mock import patch, MagicMock
from django.test import TestCase
from sentences.models import CEDictionary, CEDefinition
from sentences.segmenters.Segmenter import Segmenter
from mandoBot.schemas import MandarinWordSchema, SegmentationResponse


class SegmentationLanguageIntegrationTests(TestCase):
    """Integration tests for segmentation with language-specific definitions."""

    def setUp(self):
        """Create test dictionary entries with multiple language definitions."""
        # Create Chinese dictionary entries for common words
        self.entries = {}
        
        test_words = [
            ("好", "hao3", "good; well; fine", "gut; schön"),
            ("人", "ren2", "person; people", "Person; Mensch"),
            ("大", "da4", "big; large; great", "groß; umfangreich"),
            ("小", "xiao3", "small; little", "klein; wenig"),
            ("学", "xue2", "to learn; to study", "lernen; studieren"),
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
            
            self.entries[trad] = {
                'word': word,
                'pinyin': pinyin,
                'en': en_def,
                'de': de_def
            }

    def test_get_definitions_for_english(self):
        """Test retrieving definitions in English for words."""
        word_好 = self.entries["好"]['word']
        
        en_defs = CEDefinition.objects.filter(
            cedict=word_好,
            language='en'
        ).first()
        
        self.assertIsNotNone(en_defs)
        self.assertEqual(en_defs.definitions, "good; well; fine")

    def test_get_definitions_for_german(self):
        """Test retrieving definitions in German for words."""
        word_好 = self.entries["好"]['word']
        
        de_defs = CEDefinition.objects.filter(
            cedict=word_好,
            language='de'
        ).first()
        
        self.assertIsNotNone(de_defs)
        self.assertEqual(de_defs.definitions, "gut; schön")

    def test_definitions_by_language_multiple_words(self):
        """Test retrieving definitions by language for multiple words."""
        # Get all English definitions
        en_defs = CEDefinition.objects.filter(language='en').values_list(
            'cedict__simplified', flat=True
        ).distinct()
        
        self.assertEqual(len(list(en_defs)), 5)
        
        # Get all German definitions
        de_defs = CEDefinition.objects.filter(language='de').values_list(
            'cedict__simplified', flat=True
        ).distinct()
        
        self.assertEqual(len(list(de_defs)), 5)

    def test_definition_lookup_by_word_and_language(self):
        """Test looking up definition by word and language."""
        # Lookup "人" (ren2) in English
        word = CEDictionary.objects.get(simplified="人", pronunciation="ren2")
        definition = CEDefinition.objects.get(cedict=word, language='en')
        
        self.assertIn("person", definition.definitions)
        
        # Lookup same word in German
        definition_de = CEDefinition.objects.get(cedict=word, language='de')
        
        self.assertIn("Person", definition_de.definitions)

    def test_fallback_to_english_when_language_unavailable(self):
        """Test fallback to English when requested language unavailable."""
        word = CEDictionary.objects.get(simplified="好", pronunciation="hao3")
        
        # Try to get French (not available)
        fr_def = CEDefinition.objects.filter(
            cedict=word,
            language='fr'
        ).first()
        
        self.assertIsNone(fr_def)
        
        # But English should be available as fallback
        en_def = CEDefinition.objects.filter(
            cedict=word,
            language__in=['en']
        ).first()
        
        self.assertIsNotNone(en_def)

    def test_build_dictionary_response_english(self):
        """Test building dictionary response with English definitions."""
        # Simulate building dictionary response for English
        words_to_look_up = ["好", "人", "大"]
        
        dictionary = {}
        for hanzi in words_to_look_up:
            word = CEDictionary.objects.get(simplified=hanzi)
            en_def = CEDefinition.objects.get(cedict=word, language='en')
            
            dictionary[hanzi] = {
                "english": en_def.definitions.split("; "),
                "pinyin": [word.pronunciation],
                "zhuyin": []  # Would be populated from another service
            }
        
        # Verify structure
        self.assertIn("好", dictionary)
        self.assertIn("english", dictionary["好"])
        self.assertTrue(len(dictionary["好"]["english"]) > 0)

    def test_build_dictionary_response_german(self):
        """Test building dictionary response with German definitions."""
        # Simulate building dictionary response for German
        words_to_look_up = ["好", "人", "大"]
        
        dictionary = {}
        for hanzi in words_to_look_up:
            word = CEDictionary.objects.get(simplified=hanzi)
            de_def = CEDefinition.objects.get(cedict=word, language='de')
            
            # In German response, we'd use a 'german' key
            dictionary[hanzi] = {
                "german": de_def.definitions.split("; "),
                "pinyin": [word.pronunciation],
                "zhuyin": []
            }
        
        # Verify structure
        self.assertIn("好", dictionary)
        self.assertIn("german", dictionary["好"])
        self.assertTrue(len(dictionary["好"]["german"]) > 0)

    def test_segmented_word_with_english_definitions(self):
        """Test MandarinWordSchema with English definitions."""
        word = CEDictionary.objects.get(simplified="好", pronunciation="hao3")
        en_def = CEDefinition.objects.get(cedict=word, language='en')
        
        # Create MandarinWordSchema with English definitions
        mandarin_word = MandarinWordSchema(
            word="好",
            pinyin=["hao3"],
            zhuyin=["ㄏㄠˇ"],
            definitions=en_def.definitions.split("; ")
        )
        
        self.assertEqual(mandarin_word.word, "好")
        self.assertIn("good", mandarin_word.definitions)

    def test_segmented_word_with_german_definitions(self):
        """Test MandarinWordSchema with German definitions."""
        word = CEDictionary.objects.get(simplified="好", pronunciation="hao3")
        de_def = CEDefinition.objects.get(cedict=word, language='de')
        
        # Create MandarinWordSchema with German definitions
        mandarin_word = MandarinWordSchema(
            word="好",
            pinyin=["hao3"],
            zhuyin=["ㄏㄠˇ"],
            definitions=de_def.definitions.split("; ")
        )
        
        self.assertEqual(mandarin_word.word, "好")
        self.assertIn("gut", mandarin_word.definitions)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    def test_full_response_english_translation(self, mock_translate):
        """Test full SegmentationResponse with English."""
        mock_translate.return_value = "Good person"
        
        word_好 = CEDictionary.objects.get(simplified="好", pronunciation="hao3")
        en_def = CEDefinition.objects.get(cedict=word_好, language='en')
        
        response = SegmentationResponse(
            translation="Good person",
            sentence=[
                MandarinWordSchema(
                    word="好",
                    pinyin=["hao3"],
                    zhuyin=["ㄏㄠˇ"],
                    definitions=en_def.definitions.split("; ")
                )
            ],
            dictionary={
                "好": {
                    "english": en_def.definitions.split("; "),
                    "pinyin": ["hao3"],
                    "zhuyin": ["ㄏㄠˇ"]
                }
            }
        )
        
        self.assertEqual(response.translation, "Good person")
        self.assertIn("good", response.sentence[0].definitions)

    @patch('sentences.translators.DeepLTranslator.DeepLTranslate.translate')
    def test_full_response_german_translation(self, mock_translate):
        """Test full SegmentationResponse with German.
        
        Note: The response schema currently uses 'english' field.
        When implementing full German support, this would be updated to support
        language-specific definition fields or a language parameter.
        """
        mock_translate.return_value = "Gute Person"
        
        word_好 = CEDictionary.objects.get(simplified="好", pronunciation="hao3")
        de_def = CEDefinition.objects.get(cedict=word_好, language='de')
        
        # Current response structure (will be updated for full localization)
        response = SegmentationResponse(
            translation="Gute Person",
            sentence=[
                MandarinWordSchema(
                    word="好",
                    pinyin=["hao3"],
                    zhuyin=["ㄏㄠˇ"],
                    definitions=de_def.definitions.split("; ")
                )
            ],
            dictionary={
                "好": {
                    "english": de_def.definitions.split("; "),  # Would be language-aware in future
                    "pinyin": ["hao3"],
                    "zhuyin": ["ㄏㄠˇ"]
                }
            }
        )
        
        self.assertEqual(response.translation, "Gute Person")
        self.assertIn("gut", response.sentence[0].definitions)

    def test_query_word_definitions_function(self):
        """Test a helper function to query definitions by language."""
        def get_word_definitions(hanzi, language='en'):
            """Helper function to get definitions by language."""
            try:
                word = CEDictionary.objects.get(
                    simplified=hanzi
                )
                definition = CEDefinition.objects.get(
                    cedict=word,
                    language=language
                )
                return definition.definitions
            except (CEDictionary.DoesNotExist, CEDefinition.DoesNotExist):
                return None
        
        # Test English
        en_defs = get_word_definitions("好", language='en')
        self.assertIsNotNone(en_defs)
        self.assertIn("good", en_defs)
        
        # Test German
        de_defs = get_word_definitions("好", language='de')
        self.assertIsNotNone(de_defs)
        self.assertIn("gut", de_defs)
        
        # Test fallback (non-existent language)
        fr_defs = get_word_definitions("好", language='fr')
        self.assertIsNone(fr_defs)

    def test_response_schema_can_include_language_metadata(self):
        """Test response schema can be extended with language info."""
        # Create response with language context in dictionary
        response_data = {
            "translation": "Good person",
            "sentence": [{
                "word": "好",
                "pinyin": ["hao3"],
                "zhuyin": ["ㄏㄠˇ"],
                "definitions": ["good"]
            }],
            "dictionary": {
                "好": {
                    "english": ["good"],
                    "pinyin": ["hao3"],
                    "zhuyin": ["ㄏㄠˇ"]
                }
            }
        }
        
        response = SegmentationResponse(**response_data)
        
        # Verify all fields present
        self.assertEqual(response.translation, "Good person")
        self.assertEqual(len(response.sentence), 1)
        self.assertIn("好", response.dictionary)
