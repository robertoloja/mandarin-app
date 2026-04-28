from django.db import models


class ReadingRoomChapter(models.Model):
    book_slug = models.CharField(max_length=100, db_index=True)
    chapter_order = models.IntegerField()
    chapter_number = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    data = models.JSONField()

    class Meta:
        unique_together = ("book_slug", "chapter_order")
        ordering = ["book_slug", "chapter_order"]

    def __str__(self):
        return f"{self.book_slug} / {self.chapter_number} — {self.title}"
