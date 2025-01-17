from typing import List
from django.db import models
from .validators import is_pinyin, is_simplified, is_traditional


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
    hanzi = models.ManyToManyField(
        "self",
        through="ConstituentHanzi",
        through_fields=("word", "hanzi"),
        related_name="is_in",
        symmetrical=False,
    )

    def get_hanzi(self) -> List["CEDictionary"]:
        """
        Returns an ordered QuerySet of the CEDictionary objects corresponding
        the hanzi in the CEDictionary object being manipulated.
        """
        return [
            constituent.hanzi for constituent in self.word_hanzi.select_related("hanzi")
        ]

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
        super().save()

    def __str__(self):
        return f"{self.traditional}/{self.simplified} [{self.pronunciation}]"
