
import requests
from typing import List

from sentences.segmenters import Segmenter


class ExternalRenderAPISegmenter(Segmenter):
    @staticmethod
    def segment(sentence: str) -> List[str]:
        api_url = "https://segmenter.onrender.com/segment"

        try:
            response = requests.post(api_url, json={"text": sentence})
            response.raise_for_status()
            return response.json().get("segmented_sentence")
        except requests.exceptions.RequestException as e:
            return e
