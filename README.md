
## Setup, running and stopping the app

### Docker

Run the following command in the same directory as this README.md file:

`docker-compose up -d --build`

The app will be running on [127.0.0.1:8000/](http://127.0.0.1:8000/),
with Docker running in headless mode.

You can run `docker ps` to see the containers that are running and their `ids`. There should be `mandarin-app-web` and `postgres`.

To stop the app, run `docker-compose down`.

### Run from VSCode/Cursor

In the root directory, create a `.env` file with the following contents:

```
DJANGO_SECRET_KEY=<just put anything here, it only matters in production>
MANAGE_PY_PATH=./manage.py
DJANGO_SETTINGS_MODULE=mandoBot.settings
```

Create a `.vscode` directory in the root of the project, and create a `launch.json` file with the following contents:

```json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python Debugger: Django",
      "type": "debugpy",
      "request": "launch",
      "args": ["runserver"],
      "django": true,
      "autoStartBrowser": false,
      "program": "${workspaceFolder}/manage.py"
    }
  ]
}
```

## Testing

### E2E

`npm cypress run`

### Docker

To run every test in Docker, run the following command:

`docker-compose exec web python manage.py test`

### VSCode/Cursor

In VSCode/Cursor, open the user settings: press `ctrl+p` (`command+p` in MacOS) and type "open user settings (JSON)". At the bottom of this JSON file (but before the closing curly brace), add the following lines:

```json
"python.experiments.optInto": ["pythonTestAdapter"],
"python.testing.unittestEnabled": true,
"python.testing.unittestArgs": []
```

This should make it possible for the IDE to discover all tests, so they can be run from the IDE's Test panel, as well as individually run/debugged from the Python test files.

## Documentation

The API documentation is available at [127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs).

## Friendly Captcha

Anonymous traffic to `/api/segment` and the account forms is gated by
[Friendly Captcha](https://friendlycaptcha.com) v2, a proof-of-work captcha that
normally solves itself in the background without the reader touching anything.

### How it works

The widget is mounted once for the whole app and starts solving as soon as a
page loads. What happens with the solution depends on the endpoint:

- **`/segment`** — the solution is exchanged once, at `POST /api/captcha/verify`,
  for a signed, time-boxed *pass* (30 minutes by default). The frontend caches
  the pass and sends it as an `X-Captcha-Pass` header on every segmentation, so
  one solve covers many sentences. A missing or expired pass gets a `428`, which
  the frontend answers by solving again and retrying once. The pass is signed
  with `TimestampSigner` and stores nothing server-side — no session row per
  anonymous visitor.
- **`/accounts/login`, `/accounts/register`, `/accounts/reset_password_request`**
  — one-shot submissions, so each carries its own single-use `captcha_solution`
  field, verified inline.

Authenticated subscribers skip the captcha entirely.

Server-side verification uses the official `friendly-captcha-client` SDK. It
reports two booleans, `was_able_to_verify` and `should_accept`; `mandoBot.captcha`
widens those into a three-way verdict (`ACCEPTED` / `REJECTED` / `UNAVAILABLE`)
so an outage stays distinguishable from a genuine rejection.

**Verification fails open.** If Friendly Captcha is unreachable, times out, or
rejects our API key, the request is allowed through and the failure is logged at
`ERROR` by the `mandoBot.captcha` logger. Only a solution Friendly Captcha
positively rejects is refused. Those log lines are the only signal this is
happening, and are worth alerting on.

Note that the SDK does not wrap its own HTTP call, so a connection error or
timeout escapes as an exception; `verify_solution` catches
`requests.RequestException` for that reason. Without it an outage would surface
as a 500 and fail *closed*. The SDK's 10-second default timeout is also
overridden per call.

**Fail-open covers only one of the two failure legs.** If the *browser* cannot
reach Friendly Captcha, no solution is produced, no verification is attempted,
and the server never learns anything is wrong — so an anonymous request arrives
with no pass and is refused. Closing that gap needs a deliberate degraded mode;
see `BLOG_NOTES_FRIENDLY_CAPTCHA.md`.

The frontend mounts `@friendlycaptcha/sdk` directly. The `friendly-captcha-react`
and `django-friendly-captcha` packages were evaluated and rejected: both are
community integrations still built on the v1 `friendly-challenge` widget, and the
Django one assumes `forms.Form` rather than an API.

### Configuration

Backend, in the root `.env`:

```
FRIENDLY_CAPTCHA_ENABLED=True          # off unless set to exactly "True"
FRIENDLY_CAPTCHA_SITEKEY=FC...         # public
FRIENDLY_CAPTCHA_API_KEY=A1...         # secret, backend only, never in frontend/
FRIENDLY_CAPTCHA_ENDPOINT=global         # "global", "eu", or a full base URL
```

Frontend, as a Netlify build environment variable:

```
NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITEKEY=FC...
```

The frontend is a static export, so anything named `NEXT_PUBLIC_*` is baked into
published JavaScript. Only the **sitekey** belongs there. The **API key** is a
secret and must stay in the backend `.env`.

`FRIENDLY_CAPTCHA_ENABLED` is the master switch: it defaults to off, so local
development and the test suite need no Friendly Captcha account, and flipping it
to anything but `True` in production is an instant rollback.

### Before enabling in production

PythonAnywhere restricts outbound HTTP on free accounts to a whitelist. Confirm
the backend can reach Friendly Captcha before switching this on:

```
curl -sS -o /dev/null -w '%{http_code}\n' https://global.frcapi.com/api/v2/captcha/siteverify
```

Anything other than a network error means outbound works. If it is blocked, the
alternative is to verify in a Netlify edge function and have Django check only a
signed token, which needs no outbound call from PythonAnywhere.
