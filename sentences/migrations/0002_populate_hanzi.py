from django.db import migrations
from ..cedict_ts import mandarin_dict_unstructured
from sentences.functions import create_dictionary_single_hanzi


def run_create_dictionary(apps, schema_editor):
    create_dictionary_single_hanzi(mandarin_dict_unstructured)


class Migration(migrations.Migration):

    dependencies = [
        ("sentences", "0001_initial"),
    ]

    operations = [migrations.RunPython(run_create_dictionary)]
