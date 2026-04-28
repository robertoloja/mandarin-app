# Migration to simplify ReadingRoomText model
# - Remove ReadingRoomTranslation model
# - Add original_text and segmentation fields to ReadingRoomText

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sentences', '0005_cedefinition'),
    ]

    operations = [
        # Remove the ReadingRoomTranslation model entirely
        migrations.DeleteModel(
            name='ReadingRoomTranslation',
        ),
        
        # Add new fields to ReadingRoomText
        migrations.AddField(
            model_name='readingroomtext',
            name='original_text',
            field=models.TextField(default='', help_text='Raw Chinese text'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='readingroomtext',
            name='segmentation',
            field=models.JSONField(default=list, help_text='Segmented content: [{hanzi, trad, simp, pinyin}, ...]'),
            preserve_default=False,
        ),
    ]
