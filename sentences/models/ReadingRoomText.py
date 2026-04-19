import json
from django.db import models
from django.core.exceptions import ValidationError


class ReadingRoomText(models.Model):
    """
    Metadata for a Reading Room text (book chapter).
    Can have multiple translations via ReadingRoomTranslation.
    """
    book = models.CharField(
        max_length=100,
        help_text="Book title (e.g., 'Romance of Three Kingdoms')"
    )
    book_order = models.IntegerField(
        help_text="Display order of the book"
    )
    chapter_number = models.CharField(
        max_length=50,
        help_text="Chapter number (e.g., Chinese numerals: 一, 二, 三)"
    )
    chapter_order = models.IntegerField(
        help_text="Display order within the book"
    )
    title = models.CharField(
        max_length=200,
        help_text="Chapter title (in English)"
    )
    
    # Metadata
    source = models.CharField(
        max_length=500,
        blank=True,
        help_text="Source attribution (author, publication info)"
    )
    license = models.CharField(
        max_length=500,
        blank=True,
        help_text="License information (e.g., Creative Commons)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('book', 'book_order', 'chapter_order')
        ordering = ['book_order', 'chapter_order']
        verbose_name = "Reading Room Text"
        verbose_name_plural = "Reading Room Texts"

    def __str__(self):
        return f"{self.book} - Chapter {self.chapter_number}: {self.title}"

    def get_page_count(self, language='en'):
        """Get the number of pages for a specific language translation."""
        translation = self.translations.filter(language=language).first()
        if translation:
            return translation.page_count
        return 0


class ReadingRoomTranslation(models.Model):
    """
    Language-specific translation of a Reading Room text.
    Stores the full segmented content that can be paginated.
    """
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('de', 'German'),
        ('zh', 'Simplified Chinese'),
        ('zh-trad', 'Traditional Chinese'),
    ]

    text = models.ForeignKey(
        ReadingRoomText,
        on_delete=models.CASCADE,
        related_name='translations',
        help_text="The reading room text this translation belongs to"
    )
    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        help_text="Language of this translation"
    )
    json_data = models.JSONField(
        help_text="Full segmented content (array of sentence objects)"
    )
    page_count = models.IntegerField(
        default=0,
        help_text="Cached page count (auto-calculated)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('text', 'language')
        verbose_name = "Reading Room Translation"
        verbose_name_plural = "Reading Room Translations"
        indexes = [
            models.Index(fields=['text', 'language']),
        ]

    def __str__(self):
        return f"{self.text} - {self.get_language_display()}"

    def clean(self):
        """Validate that json_data is valid and calculate page count."""
        if isinstance(self.json_data, str):
            try:
                data = json.loads(self.json_data)
            except json.JSONDecodeError:
                raise ValidationError("Invalid JSON format in json_data")
        elif isinstance(self.json_data, (list, dict)):
            data = self.json_data
        else:
            raise ValidationError("json_data must be JSON-serializable")
        
        # Ensure it's a list for pagination
        if not isinstance(data, list):
            raise ValidationError("json_data must be a list of segments")

    def save(self, *args, **kwargs):
        """Auto-calculate page count based on json_data."""
        self.clean()
        
        # Calculate page count
        if isinstance(self.json_data, str):
            data = json.loads(self.json_data)
        else:
            data = self.json_data
        
        if isinstance(data, list):
            # Assume 50 segments per page by default
            self.page_count = max(1, (len(data) + 49) // 50)
        else:
            self.page_count = 1

        super().save(*args, **kwargs)
