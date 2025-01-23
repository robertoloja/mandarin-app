import os
from datetime import datetime
import json
from typing import Dict, List, Literal, Tuple, TYPE_CHECKING

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
from django.db import IntegrityError
from django.middleware.csrf import get_token
from ninja import Router, Form

from mandoBot.schemas import (
    APIError,
    APIPasswordError,
    ChangePasswordSchema,
    PronunciationPreferenceSchema,
    SuccessResponseSchema,
    RegisterSchema,
    UserSchema,
    UserPreferencesSchema,
)
from mandoBot.settings import DEBUG
from .models import MandoBotUser, PaidButUnregistered, ResetPasswordRequest

if TYPE_CHECKING:
    User: type[MandoBotUser]
else:
    User = get_user_model()

router = Router(tags=["accounts"])


def set_new_password(
    request,
    user: MandoBotUser,
    new_password: str,
    confirmation: str,
    current_password: str = "",
) -> (
    Tuple[Literal[200], Dict[Literal["message"], str]]
    | Tuple[Literal[400], Dict[Literal["error"], List[str]]]
):
    errors: List[str] = []

    if current_password and not check_password(current_password, user.password):
        errors += ["Current password incorrect"]

    if new_password != confirmation:
        errors += ["New password does not match password confirmation"]

    try:
        validate_password(new_password)
    except ValidationError as e:
        errors += e.messages

    if errors:
        return 400, {"error": errors}

    user.set_password(new_password)
    user.save()
    login(request, user)

    return 200, {"message": "Password changed"}


@router.post(
    "/reset_password", response={200: SuccessResponseSchema, 404: APIPasswordError}
)
def reset_password(
    request, reset_token: Form[str], new_password: Form[str], confirmation: Form[str]
):
    try:
        entry = ResetPasswordRequest.objects.get(reset_token=reset_token)
        return set_new_password(request, entry.user, new_password, confirmation)
    except ResetPasswordRequest.DoesNotExist:
        return 404, {"error": "Couldn't find this password reset request."}


@router.post(
    "/reset_password_request", response={200: SuccessResponseSchema, 404: APIError}
)
def reset_password_request(request, email: Form[str]):

    try:
        user = User.objects.get(email=email)
        entry = ResetPasswordRequest(user=user)
        entry.save()
        return 200, {"message": "Password reset e-mail will be sent."}

    except User.DoesNotExist:
        return 404, {"error": "Couldn't find user with given e-mail address."}


@router.get("/csrf")
def csrf_endpoint(request):
    return get_token(request)


@router.post(
    "/change_password", response={200: SuccessResponseSchema, 400: APIPasswordError}
)
def change_password(request, new_password: Form[ChangePasswordSchema]):
    user: MandoBotUser = request.user

    return set_new_password(
        request,
        user,
        new_password.new_password,
        new_password.password_confirmation,
        new_password.password,
    )


@router.post(
    "/login",
    response={200: UserPreferencesSchema, 401: APIError, 403: APIError},
)
def login_endpoint(
    request, payload: Form[UserSchema]
) -> Dict[str, str] | Tuple[int, APIError]:
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        user_object = User.objects.get(username=user.username)

        if (
            user_object.subscription_is_active()
            or user_object.is_staff
            or user_object.is_superuser
        ):
            login(request, user)
            response = {"username": user_object.username, "email": user_object.email}

            return response
        else:
            return 403, APIError(error="Subscription has expired")
    else:
        return 401, APIError(error="Invalid credentials")


@router.post("/logout", response={200: SuccessResponseSchema})
def logout_endpoint(request) -> Tuple[int, Dict[str, str]]:
    logout(request)
    # response = JsonResponse()
    # response.delete_cookie("csrftoken", path="/", domain=None)
    return 200, {"message": "Logged out successfully"}


@router.get("/registerId", response={200: str, 404: APIError, 409: APIError})
def register_id(request, register_id: str) -> Tuple[int, str] | Tuple[int, APIError]:
    try:
        email = PaidButUnregistered.objects.get(registration_id=register_id)

        if not email.registered:
            return 200, email.user_email
        else:
            return 409, APIError(error="User with this e-mail has already registered.")
    except PaidButUnregistered.DoesNotExist:
        return 404, APIError(error="Registration ID not found")


@router.post(
    "/register",
    response={
        200: SuccessResponseSchema,
        409: APIError,
        404: APIError,
        400: APIPasswordError,
    },
)
def register(
    request, payload: Form[RegisterSchema]
) -> (
    Tuple[int, SuccessResponseSchema]
    | Tuple[int, APIError]
    | Tuple[int, APIPasswordError]
):
    try:
        validate_password(payload.password)

        User.objects.create(
            username=payload.username,
            email=payload.email,
            password=make_password(payload.password),
        )
        if not DEBUG or os.getenv("TEST"):
            registration_link = PaidButUnregistered.objects.get(
                user_email=payload.email
            )
            registration_link.registered = True
            registration_link.save()
        return 200, SuccessResponseSchema(message="User created")
    except IntegrityError:
        return 409, APIError(error="User with this username or email already exists")
    except PaidButUnregistered.DoesNotExist:
        return 404, APIError(
            error="Could not find subscription information for this e-mail"
        )
    except ValidationError as e:
        return 400, APIPasswordError(error=e.messages)


@router.post("/pronunciation_preference", response={200: None, 404: APIError})
def post_user_pronunciation_preference(
    request, data: PronunciationPreferenceSchema
) -> int | Tuple[int, Dict[Literal["error"], str]]:
    """Set authenticated user's pronunciation preference.

    Returns:
        int | Tuple[int, Dict[Literal["error"], str]]: Either a success status code,
        or a 404 and APIError
    """
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user.username)
        user.pronunciation_preference = data.preference
        user.save()
        return 200
    return 404, {"error": "User not found"}


@router.post("/theme_preference", response={200: None, 404: APIError})
def post_user_theme_preference(
    request, theme: Literal[0, 1]
) -> int | Tuple[int, Dict[Literal["error"], str]]:
    """Change user's theme preference in the API.

    Args:
        request (HTTPRequest): A modified HTTPRequest from django-ninja
        theme (Literal[0, 1]): 0 is Dark and 1 is Light

    Returns:
        int | Tuple[int, Dict[Literal["error"], str]]: Either a success status code,
        or a 404 and APIError.
    """
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user.username)
        user.theme_preference = theme
        user.save()
        return 200
    return 404, {"error": "User not found"}


@router.get(
    "/user_settings",
    response={200: UserPreferencesSchema, 204: APIError},
)
def user_settings(request) -> Tuple[int, MandoBotUser] | Tuple[int, Dict[str, str]]:
    """Finds and returns the contents of the MandoBotUser for the
    currently authenticated user.

    Args:
        request (HTTPRequest): A modified HTTPRequest from django-ninja

    Returns:
        Tuple[int, UserPreferencesSchema] | Tuple[int, APIError]: Either
        a status code and the contents of a MandoBotUserObject, or a 204
        error code and APIError.
    """
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user.username)
        return 200, user
    else:
        return 204, {"error": "Couldn't find user"}


@router.post("/kofi", response={200: SuccessResponseSchema})
def receive_kofi_webhook(request, data: Form[str]) -> Tuple[int, Dict[str, str]]:
    """This endpoint is for Ko-Fi's webhook when an account event happens.
    It is exempt from ValidateAPITokenMiddleware.

    Args:
        request (HTTPRequest): A modified HTTPRequest from django-ninja
        data (Form[str]): JSON string. See accompanying test for format.

    Returns:
        Tuple[int, Dict[str, str]]: Status code and dict with success message.
    """

    json_data = json.loads(data)

    user_email = json_data["email"]
    timestamp = json_data["timestamp"]
    first_subscription = json_data["is_first_subscription_payment"]

    dt = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%SZ")
    payment_date = dt.date()

    if first_subscription:
        PaidButUnregistered.objects.create(user_email=user_email)
        return 200, {"message": "Sent registration e-mail"}

    else:
        user = User.objects.get(email=user_email)
        user.last_payment = payment_date
        user.save()

    return 200, {"message": "That worked!"}
