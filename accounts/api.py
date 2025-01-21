from datetime import datetime
import json
from typing import Dict

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.db import IntegrityError
from django.middleware.csrf import get_token
from ninja import Router, Form

from mandoBot.schemas import (
    APIError,
    RegisterResponseSchema,
    RegisterSchema,
    UserSchema,
    UserPreferencesSchema,
)
from .models import PaidButUnregistered

router = Router(tags=["accounts"])


@router.get("/csrf")
def csrf_endpoint(request):
    return get_token(request)


@router.post(
    "/login",
    response={200: UserPreferencesSchema, 401: APIError, 403: APIError},
)
def login_endpoint(request, payload: Form[UserSchema]) -> str:
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        User = get_user_model()
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
            return 403, {"error": "Subscription has expired"}
    else:
        return 401, {"error": "Invalid credentials"}


@router.post("/logout", response={200: dict})
def logout_endpoint(request) -> str:
    logout(request)
    # response = JsonResponse()
    # response.delete_cookie("csrftoken", path="/", domain=None)
    return 200, {"message": "Logged out successfully"}


@router.get("/registerId", response={200: str, 404: APIError, 409: APIError})
def register_id(request, register_id: str) -> Dict[int, str]:
    try:
        email = PaidButUnregistered.objects.get(registration_id=register_id)

        if not email.registered:
            return 200, email.user_email
        else:
            return 409, {"error": "User with this e-mail has already registered."}
    except PaidButUnregistered.DoesNotExist:
        return 404, {"error": "Registration ID not found"}


@router.post(
    "/register", response={200: RegisterResponseSchema, 409: APIError, 404: APIError}
)
def register(request, payload: Form[RegisterSchema]) -> RegisterResponseSchema:
    try:
        User = get_user_model()
        User.objects.create(
            username=payload.username,
            email=payload.email,
            password=make_password(payload.password),
        )
        registration_link = PaidButUnregistered.objects.get(user_email=payload.email)
        registration_link.registered = True
        registration_link.save()
        return 200, {"success": True, "message": "User created"}
    except IntegrityError:
        return 409, {"error": "User with this username or email already exists"}
    except PaidButUnregistered.DoesNotExist:
        return 404, {"error": "Could not find subscription information for this e-mail"}


@router.get("/user_settings", response={200: UserPreferencesSchema, 404: APIError})
def user_settings(request):
    print(request.user)
    if request.user.is_authenticated:
        User = get_user_model()
        user = User.objects.get(username=request.user.username)
        return user
    else:
        return 404, {"error": "User not found"}


@router.post("/kofi", response={200: Dict[str, str]})
def receive_kofi_webhook(request, data: Form[str]) -> str:
    """
    This endpoint is for Ko-Fi's webhook when an account event happens.
    It is exempt from ValidateAPITokenMiddleware.
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
        User = get_user_model()
        user = User.objects.get(email=user_email)
        user.last_payment = payment_date
        user.save()

    return 200, {"message": "That worked!"}
