from dragonmapper import hanzi
from .models import CEDictionary, Hanzi


def create_dictionary_single_hanzi(lines: str):
    """
    We're going to first add all the single-hanzi words, so multi-hanzi words
    will get queued to be added at the end, so that they can have foreign keys
    to their constituent hanzi.
    """
    queued_words = {}

    for line in lines.split("\n"):
        if line == "":
            continue

        fields = line.split()
        traditional, simplified, rest = fields[0], fields[1], fields[2:]
        pronunciation = " ".join(rest).split("]")[0][1:]
        definitions = " ".join(rest).split("/")[1:-1]

        if len(traditional) == 1:
            CEDictionary(
                traditional=traditional,
                simplified=simplified,
                pronunciation=pronunciation,
                definitions=definitions,
            ).save()
        else:
            queued_words[
                f"{traditional}|{simplified}:{pronunciation}={definitions}"
            ] = {
                "traditional": traditional,
                "simplified": simplified,
                "pronunciation": pronunciation,
                "definitions": definitions,
            }

    # We've added all the individual hanzi, now let's add the longer words
    for key, value in queued_words.items():
        word = CEDictionary(
            traditional=value["traditional"],
            simplified=value["simplified"],
            pronunciation=value["pronunciation"],
            definitions=value["definitions"],
        )
        word.save()

        for index in range(len(value["traditional"])):
            if hanzi.has_chinese(value["traditional"][index]):
                try:
                    constituent_hanzi = CEDictionary.objects.filter(
                        traditional=value["traditional"][index],
                        simplified=value["simplified"][index],
                        pronunciation__exact=value["pronunciation"].split(" ")[index],
                    )

                    for candidate in constituent_hanzi:
                        relation = Hanzi(word=word, hanzi=candidate, order=index)
                        relation.save()

                except IndexError:
                    print(value["traditional"])
                    print(value["traditional"][index])
