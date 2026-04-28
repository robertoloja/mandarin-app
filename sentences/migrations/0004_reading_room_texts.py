# Generated migration for ReadingRoomText and ReadingRoomTranslation models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sentences', '0003_sentencehistory_created_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReadingRoomText',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('book', models.CharField(help_text="Book title (e.g., 'Romance of Three Kingdoms')", max_length=100)),
                ('book_order', models.IntegerField(help_text='Display order of the book')),
                ('chapter_number', models.CharField(help_text='Chapter number (e.g., Chinese numerals: 一, 二, 三)', max_length=50)),
                ('chapter_order', models.IntegerField(help_text='Display order within the book')),
                ('title', models.CharField(help_text='Chapter title (in English)', max_length=200)),
                ('source', models.CharField(blank=True, help_text='Source attribution (author, publication info)', max_length=500)),
                ('license', models.CharField(blank=True, help_text='License information (e.g., Creative Commons)', max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Reading Room Text',
                'verbose_name_plural': 'Reading Room Texts',
                'ordering': ['book_order', 'chapter_order'],
            },
        ),
        migrations.CreateModel(
            name='ReadingRoomTranslation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language', models.CharField(choices=[('en', 'English'), ('de', 'German'), ('zh', 'Simplified Chinese'), ('zh-trad', 'Traditional Chinese')], help_text='Language of this translation', max_length=10)),
                ('json_data', models.JSONField(help_text='Full segmented content (array of sentence objects)')),
                ('page_count', models.IntegerField(default=0, help_text='Cached page count (auto-calculated)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('text', models.ForeignKey(help_text='The reading room text this translation belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='translations', to='sentences.readingroomtext')),
            ],
            options={
                'verbose_name': 'Reading Room Translation',
                'verbose_name_plural': 'Reading Room Translations',
            },
        ),
        migrations.AddIndex(
            model_name='readingroomtranslation',
            index=models.Index(fields=['text', 'language'], name='sentences_r_text_id_lang_idx'),
        ),
        migrations.AddConstraint(
            model_name='readingroomtext',
            constraint=models.UniqueConstraint(fields=['book', 'book_order', 'chapter_order'], name='unique_reading_room_chapter'),
        ),
        migrations.AddConstraint(
            model_name='readingroomtranslation',
            constraint=models.UniqueConstraint(fields=['text', 'language'], name='unique_reading_room_translation'),
        ),
    ]
