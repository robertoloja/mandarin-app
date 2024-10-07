from .models import ECDictionary

def create_dictionary(lines: str):
    for line in lines.split('\n'):
        if line == '':
            continue

        fields = line.split()
        traditional, simplified, rest = fields[0], fields[1], fields[2:]
        pronunciation = ' '.join(rest).split(']')[0][1:]
        definitions = ' '.join(rest).split('/')[1:-1]

        ECDictionary(traditional=traditional, 
                     simplified=simplified,
                     pronunciation=pronunciation,
                     definitions=definitions).save()
