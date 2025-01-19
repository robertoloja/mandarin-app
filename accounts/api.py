from datetime import datetime
import json

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.core.mail import send_mail
from django.db import IntegrityError
from ninja import Router, Form

from mandoBot.schemas import (
    APILoginError,
    RegisterResponseSchema,
    RegisterSchema,
    UserSchema,
    UserPreferencesSchema,
)

router = Router(tags=["accounts"])


@router.post(
    "/login",
    response={200: UserPreferencesSchema, 401: APILoginError, 403: APILoginError},
)
def login_endpoint(request, payload: Form[UserSchema]) -> str:
    user = authenticate(username=payload.username, password=payload.password)

    if user is not None:
        User = get_user_model()
        user_object = User.objects.get(username=user.username)

        if user_object.subscription_is_active():
            login(request, user)
            response = {"username": user_object.username, "email": user_object.email}

            return response
        else:
            return 403, {"error": "Subscription has expired"}
    else:
        return 401, {"error": "Invalid credentials"}


@router.post("/logout")
def logout_endpoint(request) -> str:
    logout(request)
    response = JsonResponse({"message": "Logged out successfully"})
    response.delete_cookie("csrftoken", path="/", domain=None)
    return response


@router.get("/registerId/{register_id}", response={200: str})
def register_id(request, register_id: str) -> str:
    # TODO: Get user's e-mail from the PaidUnregistered table.
    pass


@router.post("/register", response={200: RegisterResponseSchema, 409: APILoginError})
def register(request, payload: Form[RegisterSchema]) -> RegisterResponseSchema:
    try:
        User = get_user_model()
        User.objects.create(
            username=payload.username,
            email=payload.email,
            password=make_password(payload.password),
        )
        return 200, {"success": True, "message": "User created"}
    except IntegrityError:
        return 409, {"error": "User with this username or email already exists"}


@router.get("/user_settings", response=UserPreferencesSchema)
def user_settings(request):
    if request.user.is_authenticated:
        User = get_user_model()
        user = User.objects.get(username=request.user.username)
        return user
    else:
        return "booo"


@router.post("/kofi")
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
        # TODO: Include rendered e-mail template
        send_mail(
            "Welcome!",
            "Here's your registration link",
            "mandobotserver@gmail.com",
            [user_email],
        )
        return 200, {"message": "Sent registration e-mail"}

    else:
        User = get_user_model()
        user = User.objects.get(email=user_email)
        user.last_payment = payment_date
        user.save()

    return 200, {"message": "That worked!"}
