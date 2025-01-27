from typing import Literal, Tuple, TypeAlias
from mandoBot.schemas import SegmentationResponse


APISegmentationSuccessResponse: TypeAlias = Tuple[Literal[200], SegmentationResponse]
