# Generated migration for CEDefinition model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sentences', '0004_reading_room_texts'),
    ]

    operations = [
        migrations.CreateModel(
            name='CEDefinition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language', models.CharField(choices=[('en', 'English'), ('de', 'German')], max_length=5)),
                ('definitions', models.TextField()),
                ('cedict', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='multilingual_definitions', to='sentences.cedictionary')),
            ],
            options={
                'indexes': [
                    models.Index(fields=['cedict', 'language'], name='sentences_c_cedict_language_idx'),
                    models.Index(fields=['language'], name='sentences_c_language_idx'),
                ],
                'unique_together': {('cedict', 'language')},
            },
        ),
    ]
