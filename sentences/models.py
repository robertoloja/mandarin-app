from django.db import models
from .validators import is_simplified, is_traditional, is_pinyin


class CEDictionary(models.Model):
    traditional: str = models.CharField(
        max_length=50, validators=[is_traditional], db_index=True
    )
    simplified: str = models.CharField(
        max_length=50, validators=[is_simplified], db_index=True
    )
    word_length: int = models.PositiveIntegerField(editable=False)
    pronunciation: str = models.TextField(validators=[is_pinyin])
    definitions: str = models.TextField()
    constituent_hanzi = models.ManyToManyField(
        "self", symmetrical=False, through="Hanzi"
    )

    class Meta:
        unique_together = (
            "traditional",
            "simplified",
            "word_length",
            "pronunciation",
            "definitions",
        )

    def save(self, **kwargs):
        self.word_length = len(self.traditional)
        self.definitions = "/".join(self.definitions)
        super().save()

    def __str__(self):
        return f"{self.traditional}/{self.simplified} [{self.pronunciation}]"


class Hanzi(models.Model):
    word = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="containing_words"
    )
    hanzi = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="hanzi"
    )
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.hanzi.traditional} in {self.word.traditional} (position: {self.order})"
