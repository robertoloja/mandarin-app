from django.db import models


class CustomDefinition(models.Model):
    word = models.CharField(max_length=50, unique=True, db_index=True)
    pinyin = models.JSONField(default=list)
    definitions_en = models.JSONField(default=list)
    definitions_de = models.JSONField(default=list)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['added_at']
        verbose_name = 'Custom Definition'
        verbose_name_plural = 'Custom Definitions'

    def __str__(self):
        return self.word
