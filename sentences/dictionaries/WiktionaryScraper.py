import re
from typing import Dict
import requests
from bs4 import BeautifulSoup
from dragonmapper import hanzi

from .types import WiktionaryDefinition, WiktionaryError

# TODO: Cleanup this file
class WiktionaryScraper:
    BASE_URL = "https://en.wiktionary.org/wiki/"
    LANGUAGE_NAME = "Chinese"

    def get_definitions(
        self, word: str
    ) -> Dict[int, WiktionaryDefinition] | WiktionaryError:
        """
        Scrape definitions for a given word from Wiktionary.
        :param word: The word to look up.
        :return: A dictionary with definitions for each language.
        """
        url = f"{self.BASE_URL}{word}"
        response = requests.get(url)

        if response.status_code != 200:
            return {
                "error": f"Failed to fetch data. HTTP Status Code: {response.status_code}"
            }

        soup = BeautifulSoup(response.content, "html.parser")

        results: dict[int, WiktionaryDefinition] = {}

        headers = soup.find_all("h2")
        chinese_headers = [x for x in headers if self.LANGUAGE_NAME in x]

        if len(chinese_headers) == 0:
            return {"error": "Couldn't find chinese pronunciations"}

        # Find pronunciation
        header = chinese_headers[0]
        pronunciation_header = header.find_next("h3", string="Pronunciation")

        if not pronunciation_header:
            num = 1

            while True:
                pronunciation_header = header.find_next(
                    "h3", string=f"Pronunciation {num}"
                )

                if not pronunciation_header:
                    break

                pronunciation = (
                    header.find_next("a", string="Mandarin")
                    .find_next("a", string="Pinyin")
                    .find_next("span")
                    .text
                )
                accented = re.sub(r"\(.*?\)", "", pronunciation).strip()
                numbered = re.findall(
                    r"[a-zA-Z]+(?:\d+)?", hanzi.accented_to_numbered(accented)
                )

                results[num] = {"pronunciation": numbered}

                definitions_header = pronunciation_header.find_next(
                    "h4", string="Definitions"
                )

                if not definitions_header:
                    definitions_header = pronunciation_header.find_next(
                        "h3"
                    )  # "Noun" or "Verb" or wtv

                if not definitions_header:
                    return {"error": "Couldn't find definitions header"}

                primary_definition = (
                    definitions_header.find_next("ol")
                    .find_next("li")
                    .text.split("\n")[0]
                )

                results[num]["definition"] = primary_definition

                num = num + 1

        mandarin_pronunciation = header.find_next("a", string="Mandarin")

        if not mandarin_pronunciation:
            return {"error": "Couldn't find mandarin pronunciation"}

        pronunciation = (
            mandarin_pronunciation.find_next("a", string="Pinyin")
            .find_next("span")
            .text
        )

        if "," in pronunciation:
            pronunciation = pronunciation.split(", ")[0]

        accented = re.sub(r"\(.*?\)", "", pronunciation).strip()
        numbered = re.findall(
            r"[a-zA-Z]+(?:\d+)?", hanzi.accented_to_numbered(accented)
        )

        results[1] = {"pronunciation": numbered}

        definitions_header = mandarin_pronunciation.find_next(
            "h4", string="Definitions"
        )

        if not definitions_header:
            definitions_header = pronunciation_header.find_next(
                "h3"
            )  # "Noun" or "Verb" or wtv

        if not definitions_header:
            return {"error": "Couldn't find definitions header"}

        primary_definition = (
            definitions_header.find_next("ol").find_next("li").text.split("\n")[0]
        )

        results[1]["definition"] = primary_definition
        return results

    @staticmethod
    def _clean_html(element):
        """
        Clean HTML content from a BeautifulSoup element.
        :param element: The BeautifulSoup element containing text.
        :return: A cleaned string without HTML tags.
        """
        return element.get_text().strip()
