# Generated by Django 5.1.1 on 2024-10-08 22:20

import django.db.models.deletion
import sentences.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sentences', '0002_create_dictionary_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ecdictionary',
            name='pronunciation',
            field=models.TextField(validators=[sentences.validators.is_pinyin]),
        ),
        migrations.AlterField(
            model_name='ecdictionary',
            name='simplified',
            field=models.TextField(validators=[sentences.validators.is_simplified]),
        ),
        migrations.AlterField(
            model_name='ecdictionary',
            name='traditional',
            field=models.TextField(validators=[sentences.validators.is_traditional]),
        ),
        migrations.AlterField(
            model_name='sentence',
            name='text',
            field=models.TextField(validators=[sentences.validators.has_chinese]),
        ),
        migrations.CreateModel(
            name='WordsInSentence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.IntegerField()),
                ('sentence', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sentences.sentence')),
                ('word', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='sentences.ecdictionary')),
            ],
        ),
        migrations.AddField(
            model_name='sentence',
            name='words',
            field=models.ManyToManyField(through='sentences.WordsInSentence', to='sentences.ecdictionary'),
        ),
    ]
