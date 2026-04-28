"""
Tests for ReadingRoomText model for the new reading room architecture.

Tests verify that:
1. ReadingRoomText model stores language-agnostic segmentation correctly
2. Segmentation format is valid JSON (list of word objects)
3. Segmentation contains required fields: hanzi, trad, simp, pinyin
4. Model validations work properly
5. Unique constraints are enforced on book/chapter_order
6. Metadata fields (book, title, source, license) are optional as needed
"""

import json
from django.test import TestCase
from django.core.exceptions import ValidationError
from sentences.models import ReadingRoomText


class ReadingRoomTextModelTests(TestCase):
    """Tests for ReadingRoomText model structure and functionality."""

    def setUp(self):
        """Create test data."""
        # Sample segmentation: 某君昆仲 (some person and siblings)
        self.valid_segmentation = [
            {
                "hanzi": "某",
                "trad": "某",
                "simp": "某",
                "pinyin": "mǒu"
            },
            {
                "hanzi": "君",
                "trad": "君",
                "simp": "君",
                "pinyin": "jūn"
            },
            {
                "hanzi": "昆",
                "trad": "昆",
                "simp": "昆",
                "pinyin": "kūn"
            },
            {
                "hanzi": "仲",
                "trad": "仲",
                "simp": "仲",
                "pinyin": "zhòng"
            }
        ]
        
        self.original_text = "某君昆仲"

    def test_reading_room_text_creation_with_valid_segmentation(self):
        """Verify ReadingRoomText can be created with valid segmentation."""
        text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        self.assertIsNotNone(text.id)
        self.assertEqual(text.book, "Test Book")
        self.assertEqual(text.original_text, self.original_text)
        self.assertEqual(len(text.segmentation), 4)

    def test_segmentation_contains_required_fields(self):
        """Verify that each word in segmentation has required fields."""
        text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        # Fetch and verify structure
        fetched = ReadingRoomText.objects.get(id=text.id)
        self.assertIsInstance(fetched.segmentation, list)
        
        for word in fetched.segmentation:
            self.assertIn("hanzi", word)
            self.assertIn("trad", word)
            self.assertIn("simp", word)
            self.assertIn("pinyin", word)

    def test_segmentation_validation_invalid_json(self):
        """Verify that invalid JSON in segmentation raises ValidationError."""
        text = ReadingRoomText(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text=self.original_text,
            segmentation='{"invalid json'  # Invalid JSON string
        )
        
        with self.assertRaises(ValidationError):
            text.clean()

    def test_segmentation_validation_not_list(self):
        """Verify that non-list segmentation raises ValidationError."""
        text = ReadingRoomText(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text=self.original_text,
            segmentation={"not": "a list"}  # Dict instead of list
        )
        
        with self.assertRaises(ValidationError):
            text.clean()

    def test_empty_segmentation_list_is_valid(self):
        """Verify that an empty segmentation list is valid (for empty chapters)."""
        text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Empty Chapter",
            original_text="",
            segmentation=[]
        )
        
        self.assertEqual(len(text.segmentation), 0)

    def test_unique_constraint_on_book_chapter_order(self):
        """Verify unique constraint prevents duplicate book/chapter_order combinations."""
        from django.db import IntegrityError
        
        # Create first text
        ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Chapter 1",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        # Attempt to create duplicate should raise IntegrityError
        with self.assertRaises(IntegrityError):
            ReadingRoomText.objects.create(
                book="Test Book",
                book_order=1,
                chapter_number="二",  # Different chapter number
                chapter_order=1,  # But same chapter_order - should conflict
                title="Duplicate Chapter",
                original_text=self.original_text,
                segmentation=self.valid_segmentation
            )

    def test_different_books_can_have_same_chapter_order(self):
        """Verify that different books can share chapter_order values."""
        # Create chapter 1 in Book A
        ReadingRoomText.objects.create(
            book="Book A",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Book A Chapter 1",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        # Create chapter 1 in Book B (should not conflict)
        text2 = ReadingRoomText.objects.create(
            book="Book B",
            book_order=2,
            chapter_number="一",
            chapter_order=1,
            title="Book B Chapter 1",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        self.assertEqual(text2.book, "Book B")
        self.assertEqual(ReadingRoomText.objects.filter(chapter_order=1).count(), 2)

    def test_metadata_fields_are_optional(self):
        """Verify that source and license fields are optional."""
        text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
            # No source or license
        )
        
        self.assertEqual(text.source, "")
        self.assertEqual(text.license, "")

    def test_metadata_fields_with_values(self):
        """Verify that source and license can be stored."""
        text = ReadingRoomText.objects.create(
            book="Romance of Three Kingdoms",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="The Challenge from the Yellow Turbans",
            original_text=self.original_text,
            segmentation=self.valid_segmentation,
            source="Luo Guanzhong (14th century)",
            license="Public Domain"
        )
        
        self.assertEqual(text.source, "Luo Guanzhong (14th century)")
        self.assertEqual(text.license, "Public Domain")

    def test_str_representation(self):
        """Verify string representation is readable."""
        text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        str_repr = str(text)
        self.assertIn("Test Book", str_repr)
        self.assertIn("一", str_repr)
        self.assertIn("Test Chapter", str_repr)

    def test_timestamps_auto_set(self):
        """Verify created_at and updated_at are automatically set."""
        text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        self.assertIsNotNone(text.created_at)
        self.assertIsNotNone(text.updated_at)

    def test_segmentation_with_additional_fields(self):
        """Verify that segmentation can include additional optional fields (for future use)."""
        extended_segmentation = [
            {
                "hanzi": "某",
                "trad": "某",
                "simp": "某",
                "pinyin": "mǒu",
                "part_of_speech": "pronoun",  # Additional field
                "frequency": 5000  # Additional field
            }
        ]
        
        text = ReadingRoomText.objects.create(
            book="Test Book",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Test Chapter",
            original_text="某",
            segmentation=extended_segmentation
        )
        
        # Verify additional fields are preserved
        self.assertEqual(text.segmentation[0]["part_of_speech"], "pronoun")
        self.assertEqual(text.segmentation[0]["frequency"], 5000)

    def test_ordering_by_book_and_chapter(self):
        """Verify that ReadingRoomText is ordered by book_order then chapter_order."""
        # Create texts out of order
        ReadingRoomText.objects.create(
            book="Book B",
            book_order=2,
            chapter_number="一",
            chapter_order=1,
            title="Book B Chapter 1",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        ReadingRoomText.objects.create(
            book="Book A",
            book_order=1,
            chapter_number="二",
            chapter_order=2,
            title="Book A Chapter 2",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        ReadingRoomText.objects.create(
            book="Book A",
            book_order=1,
            chapter_number="一",
            chapter_order=1,
            title="Book A Chapter 1",
            original_text=self.original_text,
            segmentation=self.valid_segmentation
        )
        
        # Query all and verify order
        texts = ReadingRoomText.objects.all()
        
        # Should be ordered: Book A Ch1, Book A Ch2, Book B Ch1
        self.assertEqual(texts[0].title, "Book A Chapter 1")
        self.assertEqual(texts[1].title, "Book A Chapter 2")
        self.assertEqual(texts[2].title, "Book B Chapter 1")
