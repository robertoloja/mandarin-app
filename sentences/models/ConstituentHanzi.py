from django.db import models
from .CEDictionary import CEDictionary


class ConstituentHanzi(models.Model):
    word = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="word_hanzi"
    )
    hanzi = models.ForeignKey(
        CEDictionary, on_delete=models.CASCADE, related_name="hanzi_word"
    )
    order = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ["order"]
        unique_together = ("word", "hanzi", "order")

    def __str__(self):
        return f"{self.hanzi.traditional} in {self.word.traditional}[{self.order}]"