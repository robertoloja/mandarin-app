import json
from django.db import models
from django.contrib import admin
from django.utils.html import format_html
from django.forms import Textarea
from .models import SentenceHistory, ReadingRoomText, ReadingRoomTranslation


class ReadingRoomTranslationInline(admin.TabularInline):
    """
    Inline admin for managing translations of a reading room text.
    Allows translators to edit multiple languages from the same page.
    """
    model = ReadingRoomTranslation
    extra = 1
    fields = ('language', 'json_data_preview', 'page_count')
    readonly_fields = ('page_count', 'json_data_preview', 'created_at', 'updated_at')
    
    formfield_overrides = {
        models.JSONField: {'widget': Textarea(attrs={'rows': 10, 'cols': 80})},
    }

    def json_data_preview(self, obj):
        """Show a preview of the JSON data."""
        if obj.json_data:
            try:
                if isinstance(obj.json_data, str):
                    data = json.loads(obj.json_data)
                else:
                    data = obj.json_data
                
                count = len(data) if isinstance(data, list) else 1
                preview = json.dumps(data[:2] if isinstance(data, list) else data, 
                                   ensure_ascii=False, indent=2)[:200] + "..."
                return format_html(
                    '<pre style="max-width: 500px; overflow: auto;">{}</pre>',
                    preview
                )
            except:
                return "Invalid JSON"
        return "-"
    
    json_data_preview.short_description = "JSON Preview"


@admin.register(ReadingRoomText)
class ReadingRoomTextAdmin(admin.ModelAdmin):
    """
    Admin interface for managing Reading Room texts (books/chapters).
    Designed for non-technical users (translators) to add/modify content.
    """
    inlines = [ReadingRoomTranslationInline]
    
    list_display = (
        'book',
        'chapter_number',
        'title',
        'book_order',
        'chapter_order',
        'translation_languages',
        'created_at',
    )
    
    list_filter = (
        'book',
        'created_at',
        'updated_at',
    )
    
    search_fields = (
        'book',
        'title',
        'chapter_number',
    )
    
    fieldsets = (
        ('Book Information', {
            'fields': ('book', 'book_order'),
            'description': 'Information about the book this chapter belongs to.'
        }),
        ('Chapter Information', {
            'fields': ('chapter_number', 'chapter_order', 'title'),
            'description': 'Information about this specific chapter.'
        }),
        ('Attribution', {
            'fields': ('source', 'license'),
            'classes': ('collapse',),
            'description': 'Optional attribution and licensing information.'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    ordering = ('book_order', 'chapter_order')

    def translation_languages(self, obj):
        """Display available translations for this text."""
        languages = obj.translations.values_list('language', flat=True)
        if not languages:
            return format_html('<span style="color: red;">No translations</span>')
        
        lang_names = {lang: name for lang, name in ReadingRoomTranslation.LANGUAGE_CHOICES}
        lang_display = ', '.join(lang_names.get(lang, lang) for lang in languages)
        return format_html(
            '<span style="color: green;">{}</span>',
            lang_display
        )
    
    translation_languages.short_description = "Translations"


@admin.register(ReadingRoomTranslation)
class ReadingRoomTranslationAdmin(admin.ModelAdmin):
    """
    Admin interface for managing individual translations.
    Allows standalone editing and bulk operations.
    """
    list_display = (
        'text',
        'language_display',
        'page_count',
        'segment_count',
        'updated_at',
    )
    
    list_filter = (
        'language',
        'text__book',
        'created_at',
        'updated_at',
    )
    
    search_fields = (
        'text__book',
        'text__title',
        'language',
    )
    
    readonly_fields = (
        'page_count',
        'segment_count',
        'json_preview',
        'created_at',
        'updated_at',
    )
    
    fieldsets = (
        ('Content', {
            'fields': ('text', 'language', 'json_data'),
            'description': 'The text and its language translation.'
        }),
        ('Content Analysis', {
            'fields': ('segment_count', 'page_count', 'json_preview'),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    formfield_overrides = {
        models.JSONField: {'widget': Textarea(attrs={'rows': 15, 'cols': 120})},
    }
    
    ordering = ('text', 'language')

    def language_display(self, obj):
        """Display the language name."""
        return obj.get_language_display()
    
    language_display.short_description = "Language"

    def segment_count(self, obj):
        """Count the number of segments in the translation."""
        if obj.json_data:
            try:
                if isinstance(obj.json_data, str):
                    data = json.loads(obj.json_data)
                else:
                    data = obj.json_data
                
                if isinstance(data, list):
                    return len(data)
            except:
                pass
        return 0
    
    segment_count.short_description = "Segments"

    def json_preview(self, obj):
        """Show a formatted preview of the first few segments."""
        if obj.json_data:
            try:
                if isinstance(obj.json_data, str):
                    data = json.loads(obj.json_data)
                else:
                    data = obj.json_data
                
                # Show first 3 segments
                preview_data = data[:3] if isinstance(data, list) else data
                preview_json = json.dumps(preview_data, ensure_ascii=False, indent=2)
                return format_html(
                    '<pre style="max-width: 100%; overflow: auto; background: #f5f5f5; padding: 10px; border-radius: 4px;">{}</pre>',
                    preview_json
                )
            except Exception as e:
                return format_html(
                    '<pre style="color: red;">Error parsing JSON: {}</pre>',
                    str(e)
                )
        return "-"
    
    json_preview.short_description = "First 3 Segments Preview"
