import random
import string
from pathlib import Path

from django.contrib import admin
from django.contrib import messages
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import path
from django.utils.html import format_html

from sentences.bilingual_pipeline import build_chapter_data_from_tokens, _parse_segmented_input
from sentences.models import CustomDefinition
from sentences.models.ReadingRoomChapter import ReadingRoomChapter

_CHAPTER_REGISTRY_FILE = Path(__file__).resolve().parent / 'chapter_registry.py'


def _append_to_chapter_registry(book_slug: str, book_title: str, chapter_order: int, chapter_number: str, title: str, title_de: str) -> str:
    """Append a new entry to CHAPTER_REGISTRY. Returns the generated share_id."""
    share_id = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    content = _CHAPTER_REGISTRY_FILE.read_text()
    new_entry = (
        f'    "{share_id}": {{\n'
        f'        "book_slug": "{book_slug}",\n'
        f'        "book_title": "{book_title}",\n'
        f'        "chapter_order": {chapter_order},\n'
        f'        "chapter_number": "{chapter_number}",\n'
        f'        "title": "{title}",\n'
        f'        "title_de": "{title_de}",\n'
        f'    }},\n'
    )
    insert_pos = content.rfind('\n}')
    if insert_pos == -1:
        raise ValueError("Could not locate closing } in chapter_registry.py")
    _CHAPTER_REGISTRY_FILE.write_text(content[:insert_pos + 1] + new_entry + content[insert_pos + 1:])
    return share_id

def _sentence_to_text(sentence: list) -> str:
    """Reconstruct space-separated mandarin text from a stored sentence array.

    Paragraph-break sentinels (word == '\\n') become blank lines so the output
    can be round-tripped back through _parse_segmented_input.
    """
    parts = []
    current = []
    for entry in sentence:
        word = entry.get('word', '')
        if word == '\n':
            if current:
                parts.append(' '.join(current))
                current = []
            parts.append('')
        else:
            current.append(word)
    if current:
        parts.append(' '.join(current))
    return '\n'.join(parts)


@admin.register(ReadingRoomChapter)
class ReadingRoomChapterAdmin(admin.ModelAdmin):
    list_display = ("book_title", "chapter_number", "title", "book_slug", "chapter_order", "edit_translations_link")
    list_filter = ("book_slug",)
    ordering = ("book_slug", "chapter_order")
    readonly_fields = ("book_slug", "chapter_order", "chapter_number")
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
                "ingest/",
                self.admin_site.admin_view(self.ingest_view),
                name="sentences_readingroomchapter_ingest",
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

        if request.method == "POST":
            segmented_text = request.POST.get("segmented_text", "")
            en = request.POST.get("translation_en", "").strip()
            de = request.POST.get("translation_de", "").strip()
            title_de = request.POST.get("title_de", "").strip()

            errors = []
            if not segmented_text.strip():
                errors.append("Mandarin text cannot be empty.")
            if not en:
                errors.append("English translation cannot be empty.")
            if not de:
                errors.append("German translation cannot be empty.")

            if not errors:
                tokens = _parse_segmented_input(segmented_text)
                chapter_data = build_chapter_data_from_tokens(tokens, en, de)
                chapter_data["title_de"] = title_de
                chapter.data = chapter_data
                chapter.save()
                messages.success(request, f"Translations updated for: {chapter}")
                return redirect("../../")

            context = {
                **self.admin_site.each_context(request),
                "title": f"Edit Translations — {chapter}",
                "chapter": chapter,
                "segmented_text": segmented_text,
                "translation_en": en,
                "translation_de": de,
                "title_de": title_de,
                "errors": errors,
            }
            return render(request, "admin/edit_chapter_translations.html", context)

        context = {
            **self.admin_site.each_context(request),
            "title": f"Edit Translations — {chapter}",
            "chapter": chapter,
            "segmented_text": _sentence_to_text(chapter.data.get("sentence", [])),
            "translation_en": translation.get("en", ""),
            "translation_de": translation.get("de", ""),
            "title_de": chapter.data.get("title_de", ""),
            "errors": [],
        }
        return render(request, "admin/edit_chapter_translations.html", context)

    def ingest_view(self, request: HttpRequest) -> HttpResponse:
        """
        Accept space-separated pre-segmented Mandarin text + translations,
        build bilingual chapter data via DB lookups, and save a ReadingRoomChapter.
        Double blank lines in the text become paragraph-break sentinels.
        """
        if request.method == "POST":
            book_slug = request.POST.get("book_slug", "").strip()
            book_title = request.POST.get("book_title", "").strip()
            chapter_number = request.POST.get("chapter_number", "").strip()
            chapter_order_str = request.POST.get("chapter_order", "").strip()
            chapter_title = request.POST.get("chapter_title", "").strip()
            chapter_title_de = request.POST.get("chapter_title_de", "").strip()
            segmented_text = request.POST.get("segmented_text", "")
            en = request.POST.get("translation_en", "").strip()
            de = request.POST.get("translation_de", "").strip()

            errors = []
            if not book_slug:
                errors.append("Book slug is required.")
            if not book_title:
                errors.append("Book title is required.")
            if not chapter_number:
                errors.append("Chapter number is required.")
            if not chapter_order_str.isdigit():
                errors.append("Chapter order must be a non-negative integer.")
            if not chapter_title:
                errors.append("Chapter title is required.")
            if not chapter_title_de:
                errors.append("German chapter title is required.")
            if not segmented_text.strip():
                errors.append("Segmented text cannot be empty.")
            if not en:
                errors.append("English translation cannot be empty.")
            if not de:
                errors.append("German translation cannot be empty.")

            if not errors:
                chapter_order = int(chapter_order_str)
                tokens = _parse_segmented_input(segmented_text)
                chapter_data = build_chapter_data_from_tokens(tokens, en, de)
                chapter_data["title_de"] = chapter_title_de

                chapter, created = ReadingRoomChapter.objects.update_or_create(
                    book_slug=book_slug,
                    chapter_order=chapter_order,
                    defaults={
                        "chapter_number": chapter_number,
                        "title": chapter_title,
                        "data": chapter_data,
                    },
                )

                share_id = _append_to_chapter_registry(book_slug, book_title, chapter_order, chapter_number, chapter_title, chapter_title_de)
                action = "created" if created else "updated"
                messages.success(
                    request,
                    f"ReadingRoomChapter {action}: {book_title} Ch. {chapter_number} — {chapter_title} "
                    f"(registry id: {share_id})",
                )
                return redirect("..")

            context = {
                **self.admin_site.each_context(request),
                "title": "Ingest Pre-segmented Chapter",
                "errors": errors,
                "book_slug": book_slug,
                "book_title": book_title,
                "chapter_number": chapter_number,
                "chapter_order": chapter_order_str,
                "chapter_title": chapter_title,
                "chapter_title_de": chapter_title_de,
                "segmented_text": segmented_text,
                "translation_en": en,
                "translation_de": de,
            }
            return render(request, "admin/ingest_chapter.html", context)

        context = {
            **self.admin_site.each_context(request),
            "title": "Ingest Pre-segmented Chapter",
            "errors": [],
            "book_slug": "",
            "book_title": "",
            "chapter_number": "",
            "chapter_order": "",
            "chapter_title": "",
            "chapter_title_de": "",
            "segmented_text": "",
            "translation_en": "",
            "translation_de": "",
        }
        return render(request, "admin/ingest_chapter.html", context)



@admin.register(CustomDefinition)
class CustomDefinitionAdmin(admin.ModelAdmin):
    list_display = ('word', 'pinyin_display', 'definitions_en', 'definitions_de', 'added_at')
    search_fields = ('word',)
    readonly_fields = ('word', 'pinyin', 'added_at')
    fields = ('word', 'pinyin', 'definitions_en', 'definitions_de', 'added_at')

    def pinyin_display(self, obj):
        return ' '.join(obj.pinyin)
    pinyin_display.short_description = 'Pinyin'
