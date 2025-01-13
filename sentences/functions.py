import string
from django.db.utils import IntegrityError

from .models import CEDictionary, ConstituentHanzi
from sentences.cedict_ts import mandarin_dict_unstructured


def is_punctuation(character: str) -> bool:
    punctuation = "，。！？：；、“”‘’（）《》【】〔〕……—～· \u3000"
    return character in punctuation or character in string.punctuation


def create_dictionary_single_hanzi(lines: str):
    for line in lines.split("\n"):
        if line == "":
            continue

        fields = line.split()
        traditional, simplified, rest = fields[0], fields[1], fields[2:]
        pronunciation = " ".join(rest).split("]")[0][1:]
        definitions = " ".join(rest).split("/")[1:-1]
        traditional = "".join([x for x in traditional if not is_punctuation(x)])
        simplified = "".join([x for x in simplified if not is_punctuation(x)])

        if (
            len(traditional) == 1
            and len(simplified) == 1
            and not is_punctuation(traditional)
            and not str.isascii(traditional)
        ):
            CEDictionary(
                traditional=traditional,
                simplified=simplified,
                pronunciation=pronunciation,
                definitions=definitions,
            ).save()
        elif len(traditional) == 1:
            print(traditional)


def call(n):
    create_dictionary_n_hanzi(mandarin_dict_unstructured, n)


def create_dictionary_n_hanzi(lines: str, length: int):
    split = lines.split("\n")
    for done, line in enumerate(split):
        print(len(split) - done)
        if line == "":
            continue

        fields = line.split()
        traditional, simplified, rest = fields[0], fields[1], fields[2:]
        pronunciation = " ".join(rest).split("]")[0][1:]
        definitions = " ".join(rest).split("/")[1:-1]
        traditional = "".join([x for x in traditional if not is_punctuation(x)])
        simplified = "".join([x for x in simplified if not is_punctuation(x)])

        print(done)

        if len(traditional) == length and len(simplified) == length:
            word = CEDictionary.objects.filter(
                traditional=traditional,
                simplified=simplified,
                pronunciation=pronunciation,
                definitions=definitions,
                word_length=length,
            )
            if not word.exists():
                try:
                    word = CEDictionary(
                        traditional=traditional,
                        simplified=simplified,
                        pronunciation=pronunciation,
                        definitions=definitions,
                    )
                    word.save()
                except IntegrityError:
                    print(f"{word}")
                    continue
            else:
                word = word.first()

            constituent_pinyin = [
                x for x in pronunciation.split(" ") if not is_punctuation(x)
            ]
            constituent_traditional = [h for h in traditional]
            constituent_simplified = [h for h in simplified]

            for i in range(len(traditional)):
                if is_punctuation(traditional[i]) or str.isascii(traditional[i]):
                    continue

                if i > len(constituent_pinyin) - 1:
                    choice = None

                    while True:
                        print(
                            f"\nList index out of range: {i}, {constituent_pinyin}, {constituent_traditional}, word: {word}"
                        )
                        choice = input("Insert? If not, skip: [y/N] ")

                        if choice in ["y", "Y", "n", "N"]:
                            break
                        else:
                            print("Invalid choice")

                    if choice != "y":
                        continue

                pinyin = constituent_pinyin[i]
                trad = constituent_traditional[i]
                simp = constituent_simplified[i]

                hanzi = try_to_find(trad, simp, pinyin, definitions, word, i)

                if not hanzi:
                    print("Trad: ", trad, "\nPinyin: ", pinyin)
                    hanzi = try_to_find(trad, simp, pinyin[:-1], definitions, word, i)

                    if not hanzi:

                        hanzi = try_to_find(trad, simp, "", definitions, word, i)

                        if not hanzi:
                            choice = input(
                                f"\nCouldn't find {trad}/{simp} [{pinyin}] from {traditional} [{pronunciation}] - {definitions}. \nCreate it? [y/N] "
                            )
                            if choice in ["y", "Y"]:
                                definition = input("\nEnter definition: ")
                                new_hanzi = CEDictionary.objects.create(
                                    traditional=trad,
                                    simplified=simp,
                                    pronunciation=pinyin,
                                    definitions=definition,
                                )
                                ConstituentHanzi.objects.create(
                                    word=word, hanzi=new_hanzi, order=i
                                )


def try_to_find(trad, simp, pinyin, definitions, word, i):
    hanzi = CEDictionary.objects.filter(
        traditional=trad,
        simplified=simp,
        pronunciation__istartswith=pinyin,
        word_length=1,
    )

    if hanzi.count() > 1:
        if (
            "name" in ("").join(definitions)
            and hanzi.filter(definitions__contains="name").count() == 1
        ):
            hanzi = hanzi.filter(definitions__contains="name").first()
        elif hanzi.exclude(definitions__contains="name").count() == 1:
            hanzi = hanzi.exclude(definitions__contains="name").first()
        elif hanzi.filter(pronunciation__exact=pinyin).count() == 1:
            hanzi = hanzi.filter(pronunciation__exact=pinyin).first()
        elif hanzi.filter(traditional="個").exists():
            hanzi = hanzi.filter(traditional="個").first()
        elif hanzi.filter(traditional="上").exists():
            hanzi = hanzi.filter(traditional="上").first()
        else:
            print(f"\nFound multiple matches for {trad} in {word} {definitions}:")
            for index in range(hanzi.count()):
                print(
                    f"{index}. {hanzi[index].pronunciation} - {hanzi[index].definitions}"
                )
            choice = input("\nWhich one to use?")
            hanzi = hanzi[int(choice)]

        return ConstituentHanzi.objects.create(word=word, hanzi=hanzi, order=i)
    elif not hanzi.exists():
        return
    else:
        return ConstituentHanzi.objects.create(word=word, hanzi=hanzi.first(), order=i)
