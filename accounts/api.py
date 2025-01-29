import os
from datetime import datetime
import json
from typing import List, Literal, Tuple, TYPE_CHECKING

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
from django.db import IntegrityError
from django.middleware.csrf import get_token
from ninja import Router, Form

from accounts.types import (
    APIErrorResponse,
    APIPasswordErrorResponse,
    APISuccessResponse,
    APIUserSuccessResponse,
)
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
) -> APISuccessResponse | APIPasswordErrorResponse:
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
        return 400, APIPasswordError(error=errors)

    user.set_password(new_password)
    user.save()

    return 200, SuccessResponseSchema(message=user.username)


@router.post("/reset_password", response={200: SuccessResponseSchema, 404: APIError})
def reset_password(
    request, reset_token: Form[str], new_password: Form[str], confirmation: Form[str]
) -> APISuccessResponse | APIPasswordErrorResponse | APIErrorResponse:
    """
    Users can reset their password, given a valid token which will have been sent
    over e-mail.
    """
    try:
        entry = ResetPasswordRequest.objects.get(reset_token=reset_token, used=False)
        response = set_new_password(request, entry.user, new_password, confirmation)
        if response[0] == 200:
            entry.used = True
            entry.save()
        return response
    except ResetPasswordRequest.DoesNotExist:
        return 404, APIError(
            error="Couldn't find this password reset request, \
                             or it has already been used."
        )


@router.post(
    "/reset_password_request", response={200: SuccessResponseSchema, 404: APIError}
)
def reset_password_request(
    request, username: Form[str]
) -> APISuccessResponse | APIErrorResponse:
    """
    Hit by client when clicking on "forgot password" link. Creates a ResetPasswordRequest
    for the given e-mail, if matching user exists.
    """
    try:
        user = User.objects.get(username=username)
        entry = ResetPasswordRequest(user=user)
        entry.save()
        return 200, SuccessResponseSchema(message="Password reset e-mail will be sent.")

    except User.DoesNotExist:
        # Give no indication whether a user with this e-mail exists.
        # TODO: Log these attempts: Username and datetime
        return 200, SuccessResponseSchema(message="Password reset e-mail will be sent.")


@router.get("/csrf", response=str)
def csrf_endpoint(request) -> str:
    return get_token(request)


@router.post(
    "/change_password", response={200: SuccessResponseSchema, 400: APIPasswordError}
)
def change_password(
    request, new_password: Form[ChangePasswordSchema]
) -> APISuccessResponse | APIPasswordErrorResponse:
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
) -> APIUserSuccessResponse | APIErrorResponse:
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        user_object = User.objects.get(username=user.username)

        if (
            user_object.subscription_is_active()
            or user_object.is_staff
            or user_object.is_superuser
        ):
            login(request, user)

            return 200, user_object
        else:
            return 403, APIError(error="Subscription has expired")
    else:
        return 401, APIError(error="Invalid credentials")


@router.post("/logout", response={200: SuccessResponseSchema})
def logout_endpoint(request) -> APISuccessResponse:
    logout(request)
    return 200, SuccessResponseSchema(message="Logged out successfully")


@router.get("/registerId", response={200: str, 404: APIError, 409: APIError})
def register_id(request, register_id: str) -> Tuple[int, str] | APIErrorResponse:
    """
    Validates the registration ID that was sent by e-mail when a Ko-fi first
    account event arrives by webhook to /api/kofi.

    Returns user's e-mail, to populate the register form on the frontend.
    """
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
        201: SuccessResponseSchema,
        409: APIError,
        404: APIError,
        400: APIPasswordError,
    },
)
def register(
    request, payload: Form[RegisterSchema]
) -> APISuccessResponse | APIErrorResponse | APIPasswordErrorResponse:
    """
    Given an existing PaidButUnregistered object, allows a user to
    create an account. In DEBUG or during testing, does not check for
    PaidButUnregistered object.
    """
    try:
        validate_password(payload.password)

        if not DEBUG or os.getenv("TEST"):
            registration_link = PaidButUnregistered.objects.get(
                user_email=payload.email
            )

        User.objects.create(
            username=payload.username,
            email=payload.email,
            password=make_password(payload.password),
        )

        if not DEBUG or os.getenv("TEST"):
            registration_link.registered = True
            registration_link.save()
        return 201, SuccessResponseSchema(message="User created")

    except ValidationError as e:
        return 400, APIPasswordError(error=e.messages)

    except PaidButUnregistered.DoesNotExist:
        return 404, APIError(
            error="Could not find subscription information for this e-mail"
        )
    except IntegrityError:
        return 409, APIError(error="User with this username or email already exists")


@router.post("/pronunciation_preference", response={200: None, 404: APIError})
def post_user_pronunciation_preference(
    request, data: PronunciationPreferenceSchema
) -> int | APIErrorResponse:
    """
    Set authenticated user's pronunciation preference.
    """
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user.username)
        user.pronunciation_preference = data.preference
        user.save()
        return 200
    return 404, APIError(error="User not found")


@router.post("/theme_preference", response={200: None, 404: APIError})
def post_user_theme_preference(request, theme: Literal[0, 1]) -> int | APIErrorResponse:
    """
    Change user's theme preference in the db.
    """
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user.username)
        user.theme_preference = theme
        user.save()
        return 200
    return 404, APIError(error="User not found")


@router.get(
    "/user_settings",
    response={200: UserPreferencesSchema, 204: None},
)
def user_settings(request) -> APIUserSuccessResponse | APISuccessResponse:
    """
    Returns the MandoBotUser object for currently authenticated user.
    """
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user.username)
        return 200, user
    else:
        return 204, None


@router.post("/kofi", response={200: SuccessResponseSchema})
def receive_kofi_webhook(request, data: Form[str]) -> APISuccessResponse:
    """
    This endpoint is for Ko-Fi's webhook when an account event happens: if
    it is a first payment, creates the PaidButUnregistered object with the
    user's registration ID.

    Exempt from ValidateAPITokenMiddleware, since this request comes from
    Ko-Fi, not the frontend.
    """
    json_data = json.loads(data)

    user_email = json_data["email"]
    timestamp = json_data["timestamp"]
    first_subscription = json_data["is_first_subscription_payment"]

    dt = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%SZ")
    payment_date = dt.date()

    if first_subscription:
        PaidButUnregistered.objects.create(user_email=user_email)
        return 200, SuccessResponseSchema(message="Sent registration e-mail")

    else:
        user = User.objects.get(email=user_email)
        user.last_payment = payment_date
        user.save()

    return 200, SuccessResponseSchema(message="That worked!")
