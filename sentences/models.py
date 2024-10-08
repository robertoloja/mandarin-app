from django.db import models

from accounts.models import CustomUser
from .validators import has_chinese, is_simplified, is_traditional, is_pinyin

class Sentence(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField(validators=[has_chinese])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text

class ECDictionary(models.Model):
    traditional: str = models.TextField(validators=[is_traditional])
    simplified: str = models.TextField(validators=[is_simplified])
    pronunciation: str = models.TextField(validators=[is_pinyin])
    definitions: str = models.TextField()

    def save(self, **kwargs):
        self.definitions = '/'.join(self.definitions)
        super().save()

    def __str__(self):
        return f'{self.traditional} {self.simplified} \
            {self.pronunciation} {[x for x in self.definitions.split('/')]}'
