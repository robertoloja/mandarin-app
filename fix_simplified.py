import os
import django
from django.db.models import F
import opencc

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mandoBot.settings")
django.setup()

from sentences.models import CEDictionary  # noqa: E402

foo = CEDictionary.objects.filter(traditional=F("simplified"), word_length__gt=3)
converter = opencc.OpenCC("t2s.json")

for index, word in enumerate(foo):
    candidate = converter.convert(word.traditional)

    if candidate != word.simplified:
        print("\n")
        print("Traditional: ", word.traditional)
        print("Simplified: ", word.simplified)
        print("Pronunciation: ", word.pronunciation)
        print("Definitions: ", word.definitions)
        print("Candidate: ", candidate)
        print("\n")

        while True:
            print(f"{index} of {foo.count()}")
            choice = input("Replace? y/n - ")

            if choice == "y":
                word.simplified = candidate
                word.save()
                break
            elif choice == "n":
                break
            else:
                print("Invalid choice")
