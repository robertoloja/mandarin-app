from datetime import datetime, timezone
from django.http import JsonResponse
from django.conf import settings
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

API_ACCESS_TOKEN = settings.API_ACCESS_TOKEN


class ValidateAPITokenMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not settings.DEBUG:
            print("foo")
            x_nf_sign = request.headers.get("x-nf-sign")

            if not x_nf_sign:
                return JsonResponse({"error": "Missing x-nf-sign header"}, status=401)

            payload = self.validate_x_nf_sign(x_nf_sign)
            if not payload:
                return JsonResponse({"error": "Invalid or expired token"}, status=401)
        return self.get_response(request)


    def validate_x_nf_sign(self, x_nf_sign):
        try:
            payload = jwt.decode(x_nf_sign, API_ACCESS_TOKEN, algorithms=["HS256"])

            required_fields = ["deploy_context", "exp", "iss", "netlify_id", "site_url"]
            if not all(field in payload for field in required_fields):
                raise ValueError("Invalid payload structure")

            if payload["iss"] != "netlify":
                raise ValueError("Invalid issuer")

            current_time = datetime.now(timezone.utc).timestamp()
            if payload["exp"] < current_time:
                raise ExpiredSignatureError("Token has expired")

            return payload

        except (InvalidTokenError, ExpiredSignatureError):
            return None
        except Exception:
            return None
