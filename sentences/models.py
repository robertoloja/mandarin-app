from django.db import models
from accounts.models import CustomUser

class Sentence(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text

class ECDictionary(models.Model):
    traditional: str = models.TextField()
    simplified: str = models.TextField()
    definitions: str = models.TextField()
    pronunciation: str = models.TextField()

    def save(self, **kwargs) -> None:
        self.definitions = '/'.join(self.definitions)
        super().save()

    def __str__(self):
        return f'{self.traditional} {self.simplified} {self.pronunciation} {[x for x in self.definitions.split('/')]}'