import json

from django.contrib import admin
from django.contrib import messages
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render
from django.urls import path

from sentences.bilingual_pipeline import build_chapter_data
from sentences.chapter_registry import CHAPTER_REGISTRY
from sentences.models import SentenceHistory
from sentences.models.ReadingRoomChapter import ReadingRoomChapter


@admin.register(ReadingRoomChapter)
class ReadingRoomChapterAdmin(admin.ModelAdmin):
    list_display = ("book_title", "chapter_number", "title", "book_slug", "chapter_order")
    list_filter = ("book_slug",)
    ordering = ("book_slug", "chapter_order")
    readonly_fields = ("book_slug", "chapter_order", "chapter_number", "title")
    change_list_template = "admin/readingroomchapter_change_list.html"

    def book_title(self, obj):
        return obj.book_slug.replace("-", " ").title()
    book_title.short_description = "Book"

    def get_urls(self):
        urls = super().get_urls()
        extra = [
            path(
                "promote/",
                self.admin_site.admin_view(self.promote_view),
                name="sentences_readingroomchapter_promote",
            ),
        ]
        return extra + urls

    def promote_view(self, request: HttpRequest) -> HttpResponse:
        """
        Step 1 (GET):  Show a form — chapter dropdown + German translation textarea.
        Step 2 (POST): Generate bilingual data and save ReadingRoomChapter.
        """
        # Build dropdown choices sorted by book then chapter_order
        registry_choices = sorted(
            [
                (share_id, f"{meta['book_title']} — Ch. {meta['chapter_number']}: {meta['title']}")
                for share_id, meta in CHAPTER_REGISTRY.items()
            ],
            key=lambda x: (
                CHAPTER_REGISTRY[x[0]]["book_slug"],
                CHAPTER_REGISTRY[x[0]]["chapter_order"],
            ),
        )

        if request.method == "POST":
            share_id = request.POST.get("share_id", "").strip()
            german_translation = request.POST.get("german_translation", "").strip()

            errors = []
            if not share_id:
                errors.append("Please select a chapter.")
            if not german_translation:
                errors.append("Please enter the German translation.")

            if not errors and share_id not in CHAPTER_REGISTRY:
                errors.append(f"Unknown share_id '{share_id}'.")

            if not errors:
                try:
                    history = SentenceHistory.objects.get(sentence_id=share_id)
                except SentenceHistory.DoesNotExist:
                    errors.append(
                        f"No SentenceHistory found for share_id '{share_id}'. "
                        "Has this chapter been shared at least once?"
                    )

            if not errors:
                meta = CHAPTER_REGISTRY[share_id]
                raw = history.json_data
                segmentation = json.loads(raw) if isinstance(raw, str) else raw
                english_translation = segmentation.get("translation", "")

                chapter_data = build_chapter_data(
                    segmentation=segmentation,
                    english_translation=english_translation,
                    german_translation=german_translation,
                )

                chapter, created = ReadingRoomChapter.objects.update_or_create(
                    book_slug=meta["book_slug"],
                    chapter_order=meta["chapter_order"],
                    defaults={
                        "chapter_number": meta["chapter_number"],
                        "title": meta["title"],
                        "data": chapter_data,
                    },
                )

                action = "created" if created else "updated"
                messages.success(
                    request,
                    f"ReadingRoomChapter {action}: "
                    f"{meta['book_title']} Ch. {meta['chapter_number']} — {meta['title']}",
                )
                return redirect("..")

            context = {
                **self.admin_site.each_context(request),
                "title": "Promote Chapter to Reading Room",
                "registry_choices": registry_choices,
                "selected_share_id": share_id,
                "german_translation": request.POST.get("german_translation", ""),
                "errors": errors,
            }
            return render(request, "admin/promote_chapter.html", context)

        context = {
            **self.admin_site.each_context(request),
            "title": "Promote Chapter to Reading Room",
            "registry_choices": registry_choices,
            "selected_share_id": "",
            "german_translation": "",
            "errors": [],
        }
        return render(request, "admin/promote_chapter.html", context)
