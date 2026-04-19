from django.db import models


class CEDefinition(models.Model):
    """Store word definitions in multiple languages for each Chinese word.
    
    This model enables multilingual support for word definitions, allowing
    the same Chinese word to have definitions in English, German, and other languages.
    """
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('de', 'German'),
    ]
    
    cedict = models.ForeignKey(
        'CEDictionary',
        on_delete=models.CASCADE,
        related_name='multilingual_definitions'
    )
    language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES
    )
    definitions = models.TextField()  # Language-specific definitions
    
    class Meta:
        unique_together = ('cedict', 'language')
        indexes = [
            models.Index(fields=['cedict', 'language']),
            models.Index(fields=['language']),
        ]
    
    def __str__(self):
        cedict_str = f"{self.cedict.traditional}/{self.cedict.simplified}" if self.cedict else "N/A"
        return f"{cedict_str} [{self.get_language_display()}]"
