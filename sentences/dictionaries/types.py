from typing import TypedDict

class WiktionaryDefinition(TypedDict):
    pronunciation: str
    definition: str


class WiktionaryError(TypedDict):
    error: str

