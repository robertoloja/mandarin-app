## Deploy

Merging to `main` on github will initiate a deployment of the frontend. If `npm run build` worked locally, then the deployment should succeed.

In the backend, deploying involves:

1. Pull from remote.
2. `python manage.py dumpscript accounts > accounts/scripts/account_data.py` to backup account information.
3. locally, run `scp db.sqlite3 mandoBot@ssh.pythonanywhere.com:/home/mandoBot/mandarin-app/` to upload the database to the server. N.b. Delete all account data from the database before uploading.
4. Once the upload is complete, on the server run `python manage.py runscript account_data` to re-populate user information.
5. On the PythonAnywhere console, reload the web app and re-start the send_mail script.

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

## Deploy frontend to Netlify Pages

Make sure to remove the leading / from every address in build/index.html after running `npm run build`.
