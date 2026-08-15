import os
import sys
from pathlib import Path
from corsheaders.defaults import default_headers
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

TESTING = "test" in sys.argv

if "test" in sys.argv:
    DATABASES = DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
    }
    PYTHONDONTWRITEBYTECODE = 1

load_dotenv()
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
API_ACCESS_TOKEN = os.getenv("API_ACCESS_TOKEN")
DEBUG = os.getenv("DJANGO_DEBUG") == "True"

# Friendly Captcha. The sitekey is public and also baked into the frontend
# build; the API key is secret and must never leave the backend.
FRIENDLY_CAPTCHA_SITEKEY = os.getenv("FRIENDLY_CAPTCHA_SITEKEY", "")
FRIENDLY_CAPTCHA_API_KEY = os.getenv("FRIENDLY_CAPTCHA_API_KEY", "")
# The SDK's own shorthand: "global", "eu", or a full base URL.
FRIENDLY_CAPTCHA_ENDPOINT = os.getenv("FRIENDLY_CAPTCHA_ENDPOINT", "global")
# Master switch; flip it off in production to roll back.
#
# Always off under test, even when the developer has it switched on in their
# .env: tests that want it on turn it on themselves with override_settings, and
# the rest must not start demanding captcha passes just because a real key
# happens to be configured on this machine.
FRIENDLY_CAPTCHA_ENABLED = (
    os.getenv("FRIENDLY_CAPTCHA_ENABLED") == "True" and not TESTING
)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "ERROR",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "ERROR",
    },
}

ALLOWED_HOSTS = [
    "mandobot.pythonanywhere.com",
]

CORS_ALLOWED_ORIGINS = [
    "https://mandobot.netlify.app",
]

CORS_ALLOW_CREDENTIALS = True

# django-cors-headers only permits a default set of request headers, which does
# not include the captcha pass. In production the Netlify proxy makes the call
# same-origin, so this matters for cross-origin local development.
CORS_ALLOW_HEADERS = (*default_headers, "x-captcha-pass")

CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"

SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"

CSRF_TRUSTED_ORIGINS = ["https://mandobot.netlify.app"]

if DEBUG:
    CSRF_TRUSTED_ORIGINS += ["http://localhost:3000"]
    ALLOWED_HOSTS += ["192.168.178.91", "192.168.2.116", "127.0.0.1", "localhost", "0.0.0.0", "testserver"]
    CORS_ALLOWED_ORIGINS += [
        "http://127.0.0.1:3000",
        "https://localhost:3000",
        "http://0.0.0.0",
    ]
    CORS_ALLOW_ALL_ORIGINS = True

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # local apps
    "django_extensions",
    "corsheaders",
    "channels",
    "sentences",
    "accounts",
    "status",
]

MIDDLEWARE = [
    "django.middleware.gzip.GZipMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "mandoBot.middleware.ValidateAPITokenMiddleware",
]

ROOT_URLCONF = "mandoBot.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "mandoBot.wsgi.application"
ASGI_APPLICATION = "mandoBot.asgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DOCKER = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "postgres",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "db",
        "PORT": 5432,
    }
}

PYTHON_ANYWHERE = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "defaultdb",
        "HOST": "mandobot-1-mandobot-1.j.aivencloud.com",
        "PORT": 18958,
        "USER": "avnadmin",
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "CONN_MAX_AGE": 600,
        "OPTIONS": {
            "sslmode": "verify-ca",
            "sslrootcert": os.path.join(BASE_DIR, "ca_cert.crt"),
            "pool": True,
        },
    }
}

# if os.getenv("PYTHON_ANYWHERE") == "TRUE":
#     DATABASES = PYTHON_ANYWHERE
if os.getenv("DOCKER") == "TRUE":
    DATABASES = DOCKER
elif "test" not in sys.argv:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
        }
    }

AUTH_USER_MODEL = "accounts.MandoBotUser"

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_HOST_USER = "mandobotserver@gmail.com"
EMAIL_HOST_PASSWORD = os.getenv("GMAIL_PASSWORD")
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = "mandobotserver@gmail.com"
