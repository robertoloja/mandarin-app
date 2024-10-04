## Setup, running and stopping the app
Run the following command in the same directory as this README.md file:

`docker-compose up -d --build`

The app will be running on [127.0.0.1:8000/](http://127.0.0.1:8000/),
with Docker running in headless mode.

You can run `docker ps` to see the containers that are running and their `ids`. There should be `mandarin-app-web` and `postgres`. 

To stop the app, run `docker-compose down`.