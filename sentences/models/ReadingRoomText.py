import json
from django.db import models
from django.core.exceptions import ValidationError


class ReadingRoomText(models.Model):
    """
    A reading room text with language-agnostic segmentation.
    Definitions are fetched dynamically based on user language preference.
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
    
    # Original text and segmentation (language-agnostic, stored once)
    original_text = models.TextField(
        help_text="Raw Chinese text"
    )
    segmentation = models.JSONField(
        help_text="Segmented content: [{hanzi, trad, simp, pinyin}, ...]"
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

    def clean(self):
        """Validate that segmentation is valid JSON list."""
        if isinstance(self.segmentation, str):
            try:
                data = json.loads(self.segmentation)
            except json.JSONDecodeError:
                raise ValidationError("Invalid JSON format in segmentation")
        elif isinstance(self.segmentation, (list, dict)):
            data = self.segmentation
        else:
            raise ValidationError("segmentation must be JSON-serializable")
        
        # Ensure it's a list
        if not isinstance(data, list):
            raise ValidationError("segmentation must be a list of word objects")

    def save(self, *args, **kwargs):
        """Validate before saving."""
        self.clean()
        super().save(*args, **kwargs)
