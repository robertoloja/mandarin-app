from typing import TypeAlias, Tuple, Literal

from accounts.models import MandoBotUser
from mandoBot.schemas import APIError, APIPasswordError, SuccessResponseSchema


APIUserSuccessResponse: TypeAlias = Tuple[Literal[200], MandoBotUser]
APISuccessResponse: TypeAlias = Tuple[Literal[200, 201, 204], SuccessResponseSchema]
APIPasswordErrorResponse: TypeAlias = Tuple[Literal[400, 404], APIPasswordError]
APIErrorResponse: TypeAlias = Tuple[Literal[401, 403, 404, 409], APIError]
