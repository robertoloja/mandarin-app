from django.apps import AppConfig
from .cedict_ts import mandarin_dict_unstructured

def create_dictionary(lines):
    dictionary = {}

    for line in lines.split('\n'):
        if line == '':
            continue
        fields = line.split()
        traditional, simplified, rest = fields[0], fields[1], fields[2:]
        dictionary[traditional] = {
            'simplified': simplified,
            'pronunciation': ' '.join(rest).split(']')[0][1:],
            'definitions': ' '.join(rest).split('/')[1:-1]
        }
    return dictionary

class SentencesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sentences'

    dictionary = create_dictionary(mandarin_dict_unstructured)