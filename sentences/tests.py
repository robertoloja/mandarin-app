"""
Integration tests for the ReadingRoom API endpoint.

These tests verify that:
1. The endpoint returns the correct JSON response format
2. Definitions are localized to the requested language
3. Fallback to English occurs when target language not available
4. Response matches MandarinSentenceComponent expectations
"""

import json
from django.test import TestCase
from ninja.testing import TestClient
from mandoBot.api import api
from sentences.models import ReadingRoomText, CEDictionary, CEDefinition


class ReadingRoomAPITests(TestCase):
    """Tests for reading room API endpoint response format."""

    def setUp(self):
        """Create test data with both English and German definitions."""
        # Initialize Ninja TestClient with the API
        self.client = TestClient(api)
        
        # Create ReadingRoomText with segmentation
        self.segmentation = [
            {
                "hanzi": "好",
                "trad": "好",
                "simp": "好",
                "pinyin": "hao3"
            },
            {
                "hanzi": "人",
                "trad": "人",
                "simp": "人",
                "pinyin": "ren2"
            }
        ]
        
        self.reading_text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text="好人",
            segmentation=self.segmentation
        )
        
        # Create CEDictionary entries with English definitions
        self.cedict_hao = CEDictionary.objects.create(
            traditional="好",
            simplified="好",
            word_length=1,
            pronunciation="hao3",
            definitions="good; well; fine; excellent"
        )
        
        self.cedict_ren = CEDictionary.objects.create(
            traditional="人",
            simplified="人",
            word_length=1,
            pronunciation="ren2",
            definitions="person; people; human"
        )
        
        # Create English definitions (mirrors populate_english)
        CEDefinition.objects.create(
            cedict=self.cedict_hao,
            language='en',
            definitions='good; well; fine; excellent'
        )
        
        CEDefinition.objects.create(
            cedict=self.cedict_ren,
            language='en',
            definitions='person; people; human'
        )
        
        # Create German definitions
        CEDefinition.objects.create(
            cedict=self.cedict_hao,
            language='de',
            definitions='gut; wohl; schön'
        )
        
        CEDefinition.objects.create(
            cedict=self.cedict_ren,
            language='de',
            definitions='Person; Leute; Mensch'
        )

    def test_reading_room_response_format_english(self):
        """
        Test that the API returns the correct response format for English.
        
        Expected response structure:
        {
            "id": <id>,
            "book": "Test Book",
            "title": "Test Chapter",
            "words": [
                {
                    "hanzi": "好",
                    "trad": "好",
                    "simp": "好",
                    "pinyin": "hao3",
                    "definitions": "good; well; fine; excellent"
                },
                {
                    "hanzi": "人",
                    "trad": "人",
                    "simp": "人",
                    "pinyin": "ren2",
                    "definitions": "person; people; human"
                }
            ]
        }
        """
        response = self.client.get(
            f'/reading-room/{self.reading_text.id}/',
            {'language': 'en'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify top-level structure
        self.assertIn('id', data)
        self.assertIn('book', data)
        self.assertIn('title', data)
        self.assertIn('words', data)
        self.assertEqual(data['id'], self.reading_text.id)
        self.assertEqual(data['book'], 'Test Book')
        self.assertEqual(data['title'], 'Test Chapter')
        
        # Verify words array
        self.assertIsInstance(data['words'], list)
        self.assertEqual(len(data['words']), 2)
        
        # Verify first word (好)
        first_word = data['words'][0]
        self.assertEqual(first_word['hanzi'], '好')
        self.assertEqual(first_word['trad'], '好')
        self.assertEqual(first_word['simp'], '好')
        self.assertEqual(first_word['pinyin'], 'hao3')
        self.assertEqual(first_word['definitions'], 'good; well; fine; excellent')
        
        # Verify second word (人)
        second_word = data['words'][1]
        self.assertEqual(second_word['hanzi'], '人')
        self.assertEqual(second_word['trad'], '人')
        self.assertEqual(second_word['simp'], '人')
        self.assertEqual(second_word['pinyin'], 'ren2')
        self.assertEqual(second_word['definitions'], 'person; people; human')

    def test_reading_room_response_format_german(self):
        """
        Test that the API returns German definitions when language='de'.
        
        Should localize the response to German while keeping structure identical.
        """
        response = self.client.get(
            f'/reading-room/{self.reading_text.id}/',
            {'language': 'de'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Structure should be identical
        self.assertIn('words', data)
        self.assertEqual(len(data['words']), 2)
        
        # But definitions should be German
        first_word = data['words'][0]
        self.assertEqual(first_word['hanzi'], '好')
        self.assertEqual(first_word['definitions'], 'gut; wohl; schön')
        
        second_word = data['words'][1]
        self.assertEqual(second_word['hanzi'], '人')
        self.assertEqual(second_word['definitions'], 'Person; Leute; Mensch')

    def test_reading_room_response_fallback_to_english(self):
        """
        Test that when German definition is missing, falls back to English.
        
        This verifies the fallback chain: German -> English.
        """
        # Remove German definition for "好" to test fallback
        CEDefinition.objects.filter(
            cedict=self.cedict_hao,
            language='de'
        ).delete()
        
        response = self.client.get(
            f'/reading-room/{self.reading_text.id}/',
            {'language': 'de'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        first_word = data['words'][0]
        # Should fall back to English definition
        self.assertEqual(first_word['hanzi'], '好')
        self.assertEqual(first_word['definitions'], 'good; well; fine; excellent')
        
        # But second word should still have German
        second_word = data['words'][1]
        self.assertEqual(second_word['hanzi'], '人')
        self.assertEqual(second_word['definitions'], 'Person; Leute; Mensch')

    def test_reading_room_response_default_language(self):
        """
        Test that the endpoint defaults to English if no language parameter provided.
        """
        response = self.client.get(f'/reading-room/{self.reading_text.id}/')
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Should default to English definitions
        first_word = data['words'][0]
        self.assertEqual(first_word['definitions'], 'good; well; fine; excellent')

    def test_reading_room_response_empty_chapter(self):
        """
        Test that endpoint handles empty chapters correctly.
        """
        empty_text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="二",
            chapter_order=2,
            title="Empty Chapter",
            original_text="",
            segmentation=[]
        )
        
        response = self.client.get(
            f'/reading-room/{empty_text.id}/',
            {'language': 'en'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(len(data['words']), 0)

    def test_reading_room_response_nonexistent_chapter(self):
        """
        Test that endpoint returns 404 for nonexistent chapter.
        """
        response = self.client.get('/reading-room/99999/', {'language': 'en'})
        self.assertEqual(response.status_code, 404)

    def test_reading_room_response_preserves_segmentation_fields(self):
        """
        Test that endpoint preserves all fields from original segmentation.
        
        If segmentation has additional fields beyond the required ones,
        they should be preserved in the response.
        """
        extended_segmentation = [
            {
                "hanzi": "好",
                "trad": "好",
                "simp": "好",
                "pinyin": "hao3",
                "part_of_speech": "adjective",
                "frequency_rank": 500
            }
        ]
        
        extended_text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="三",
            chapter_order=3,
            title="Extended Fields Chapter",
            original_text="好",
            segmentation=extended_segmentation
        )
        
        response = self.client.get(
            f'/reading-room/{extended_text.id}/',
            {'language': 'en'}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        word = data['words'][0]
        # Should preserve additional fields
        self.assertEqual(word['part_of_speech'], 'adjective')
        self.assertEqual(word['frequency_rank'], 500)
        # But also have the definition
        self.assertEqual(word['definitions'], 'good; well; fine; excellent')

    def test_reading_room_response_with_invalid_language(self):
        """
        Test that endpoint handles invalid language parameter gracefully.
        
        Should probably default to English or return error.
        """
        response = self.client.get(
            f'/reading-room/{self.reading_text.id}/',
            {'language': 'xx'}  # Invalid language code
        )
        
        # Should still return 200 (or handle gracefully)
        self.assertIn(response.status_code, [200, 400])
        
        if response.status_code == 200:
            # If it returns 200, should default to English
            data = response.json()
            first_word = data['words'][0]
            self.assertEqual(first_word['definitions'], 'good; well; fine; excellent')
