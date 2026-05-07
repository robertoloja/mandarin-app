import copy
import json

from django.contrib import admin
from django.contrib import messages
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import path
from django.utils.html import format_html

from sentences.bilingual_pipeline import build_chapter_data
from sentences.chapter_registry import CHAPTER_REGISTRY
from sentences.models import SentenceHistory
from sentences.models.ReadingRoomChapter import ReadingRoomChapter

_SENTENCE_ENDINGS = frozenset('。！？.?!')
_PARAGRAPH_SENTINEL = {'word': '\n', 'pinyin': [], 'zhuyin': [], 'definitions': {}}


def _strip_sentinels(sentence: list) -> list:
    return [w for w in sentence if w.get('word') != '\n']


def _existing_break_indices(sentence: list) -> set:
    """Return the clean-array indices at which a sentinel currently sits."""
    breaks, clean_idx = set(), 0
    for word in sentence:
        if word.get('word') == '\n':
            breaks.add(clean_idx)
        else:
            clean_idx += 1
    return breaks


def _sentence_chunks(clean_words: list) -> list:
    """Split a sentinel-free word list into chunks at sentence-ending punctuation."""
    chunks, current, start = [], [], 0
    for i, word in enumerate(clean_words):
        current.append(word)
        if any(c in word.get('word', '') for c in _SENTENCE_ENDINGS):
            chunks.append({'start': start, 'text': ''.join(w['word'] for w in current)})
            start = i + 1
            current = []
    if current:
        chunks.append({'start': start, 'text': ''.join(w['word'] for w in current)})
    return chunks


@admin.register(ReadingRoomChapter)
class ReadingRoomChapterAdmin(admin.ModelAdmin):
    list_display = ("book_title", "chapter_number", "title", "book_slug", "chapter_order", "edit_translations_link")
    list_filter = ("book_slug",)
    ordering = ("book_slug", "chapter_order")
    readonly_fields = ("book_slug", "chapter_order", "chapter_number", "title")
    change_list_template = "admin/readingroomchapter_change_list.html"

    def book_title(self, obj):
        return obj.book_slug.replace("-", " ").title()
    book_title.short_description = "Book"

    def edit_translations_link(self, obj):
        return format_html(
            '<a href="{}/edit-translations/" class="button">Edit Translations</a>',
            obj.pk,
        )
    edit_translations_link.short_description = "Translations"

    def get_urls(self):
        urls = super().get_urls()
        extra = [
            path(
                "promote/",
                self.admin_site.admin_view(self.promote_view),
                name="sentences_readingroomchapter_promote",
            ),
            path(
                "<int:pk>/edit-translations/",
                self.admin_site.admin_view(self.edit_translations_view),
                name="sentences_readingroomchapter_edit_translations",
            ),
        ]
        return extra + urls

    def edit_translations_view(self, request: HttpRequest, pk: int) -> HttpResponse:
        chapter = get_object_or_404(ReadingRoomChapter, pk=pk)
        translation = chapter.data.get("translation", {})
        sentence = chapter.data.get("sentence", [])
        clean = _strip_sentinels(sentence)
        chunks = _sentence_chunks(clean)

        if request.method == "POST":
            en = request.POST.get("translation_en", "").strip()
            de = request.POST.get("translation_de", "").strip()

            errors = []
            if not en:
                errors.append("English translation cannot be empty.")
            if not de:
                errors.append("German translation cannot be empty.")

            if not errors:
                updated_data = copy.deepcopy(chapter.data)
                updated_data["translation"]["en"] = en
                updated_data["translation"]["de"] = de

                break_indices = sorted(
                    (int(v) for v in request.POST.getlist('paragraph_breaks')),
                    reverse=True,
                )
                new_sentence = _strip_sentinels(updated_data['sentence'])
                for idx in break_indices:
                    if 0 < idx <= len(new_sentence):
                        new_sentence.insert(idx, _PARAGRAPH_SENTINEL)
                updated_data['sentence'] = new_sentence

                chapter.data = updated_data
                chapter.save()
                messages.success(request, f"Translations updated for: {chapter}")
                return redirect("../../")

            existing_breaks = {int(v) for v in request.POST.getlist('paragraph_breaks')}
            context = {
                **self.admin_site.each_context(request),
                "title": f"Edit Translations — {chapter}",
                "chapter": chapter,
                "translation_en": en,
                "translation_de": de,
                "chunks": chunks,
                "existing_breaks": existing_breaks,
                "errors": errors,
            }
            return render(request, "admin/edit_chapter_translations.html", context)

        context = {
            **self.admin_site.each_context(request),
            "title": f"Edit Translations — {chapter}",
            "chapter": chapter,
            "translation_en": translation.get("en", ""),
            "translation_de": translation.get("de", ""),
            "chunks": chunks,
            "existing_breaks": _existing_break_indices(sentence),
            "errors": [],
        }
        return render(request, "admin/edit_chapter_translations.html", context)

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
