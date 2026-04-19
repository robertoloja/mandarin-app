"""
Tests for multilingual definition system (CEDefinition).

Tests verify that:
1. CEDefinition model structure is correct
2. CEDefinition works with CEDictionary via ForeignKey
3. Language-specific queries work correctly
4. Unique constraints are enforced
5. Fallback mechanisms work when definitions are missing
"""

from django.test import TestCase
from sentences.models import CEDictionary, CEDefinition


class CEDefinitionModelTests(TestCase):
    """Tests for CEDefinition model structure and relationships."""

    def setUp(self):
        """Create test data."""
        # Create test CEDictionary entries
        self.word1 = CEDictionary.objects.create(
            traditional="好",
            simplified="好",
            word_length=1,
            pronunciation="hao3",
            definitions="good; well; ..."
        )
        
        self.word2 = CEDictionary.objects.create(
            traditional="人",
            simplified="人",
            word_length=1,
            pronunciation="ren2",
            definitions="person; people; ..."
        )

    def test_cedefinition_model_exists(self):
        """Verify CEDefinition model can be instantiated."""
        definition = CEDefinition.objects.create(
            cedict=self.word1,
            language='en',
            definitions='good; well; ...'
        )
        
        self.assertEqual(definition.cedict, self.word1)
        self.assertEqual(definition.language, 'en')
        self.assertIn('good', definition.definitions)

    def test_cedefinition_language_choices(self):
        """Verify CEDefinition supports English and German."""
        english_def = CEDefinition.objects.create(
            cedict=self.word1,
            language='en',
            definitions='good'
        )
        
        german_def = CEDefinition.objects.create(
            cedict=self.word2,
            language='de',
            definitions='gut'
        )
        
        self.assertEqual(english_def.get_language_display(), 'English')
        self.assertEqual(german_def.get_language_display(), 'German')

    def test_cedefinition_unique_constraint(self):
        """Verify unique constraint prevents duplicate language definitions for same word."""
        # Create first definition
        CEDefinition.objects.create(
            cedict=self.word1,
            language='en',
            definitions='good'
        )
        
        # Attempt to create duplicate should raise IntegrityError
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            CEDefinition.objects.create(
                cedict=self.word1,
                language='en',
                definitions='different definition'
            )

    def test_cedefinition_supports_multiple_languages(self):
        """Verify a word can have definitions in multiple languages."""
        english_def = CEDefinition.objects.create(
            cedict=self.word1,
            language='en',
            definitions='good'
        )
        
        german_def = CEDefinition.objects.create(
            cedict=self.word1,
            language='de',
            definitions='gut'
        )
        
        # Both should exist for same word
        self.assertEqual(
            CEDefinition.objects.filter(cedict=self.word1).count(),
            2
        )
        
        # Query by language should work
        en_result = CEDefinition.objects.get(cedict=self.word1, language='en')
        de_result = CEDefinition.objects.get(cedict=self.word1, language='de')
        
        self.assertEqual(en_result.definitions, 'good')
        self.assertEqual(de_result.definitions, 'gut')

    def test_cedefinition_cedict_relationship(self):
        """Verify CEDefinition properly links to CEDictionary."""
        definition = CEDefinition.objects.create(
            cedict=self.word1,
            language='en',
            definitions='good'
        )
        
        # Should be able to access from both directions
        self.assertEqual(definition.cedict.traditional, "好")
        
        # Should be able to query via reverse relationship
        definitions_of_word1 = self.word1.multilingual_definitions.all()
        self.assertEqual(definitions_of_word1.count(), 1)
        self.assertEqual(definitions_of_word1.first().language, 'en')

    def test_cedefinition_query_by_language(self):
        """Verify querying definitions by language works."""
        # Create mixed definitions
        CEDefinition.objects.create(cedict=self.word1, language='en', definitions='good')
        CEDefinition.objects.create(cedict=self.word2, language='en', definitions='person')
        CEDefinition.objects.create(cedict=self.word1, language='de', definitions='gut')
        
        # Query English
        english_defs = CEDefinition.objects.filter(language='en')
        self.assertEqual(english_defs.count(), 2)
        
        # Query German
        german_defs = CEDefinition.objects.filter(language='de')
        self.assertEqual(german_defs.count(), 1)

    def test_cedefinition_fallback_pattern(self):
        """Test fallback pattern: look for target language, fall back to English."""
        # Create only English definition
        CEDefinition.objects.create(
            cedict=self.word1,
            language='en',
            definitions='good'
        )
        
        # Query for German should return None
        german = CEDefinition.objects.filter(
            cedict=self.word1,
            language='de'
        ).first()
        self.assertIsNone(german)
        
        # But English should be available as fallback
        english = CEDefinition.objects.filter(
            cedict=self.word1,
            language='en'
        ).first()
        self.assertIsNotNone(english)

    def test_cedefinition_str_representation(self):
        """Verify CEDefinition string representation is informative."""
        definition = CEDefinition.objects.create(
            cedict=self.word1,
            language='en',
            definitions='good'
        )
        
        str_repr = str(definition)
        self.assertIn('好', str_repr)
        self.assertIn('English', str_repr)
