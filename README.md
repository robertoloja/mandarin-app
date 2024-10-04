## Setup, running and stopping the app
Run the following command in the same directory as this README.md file:

`docker-compose up -d --build`

The app will be running on [127.0.0.1:8000/](http://127.0.0.1:8000/),
with Docker running in headless mode.

You can run `docker ps` to see the containers that are running and their `ids`. There should be `mandarin-app-web` and `postgres`. 

To stop the app, run `docker-compose down`.

## Admin credentials
At [127.0.0.1:8000/admin](http://127.0.0.1:8000/admin) you can access Django's admin interface. Use the following credentials 
to login as an admin:

```
username: admin
password: admin1234
```

From here, you can create, edit and delete users.

## Testing

To run every test, run the following command:

`docker-compose exec web python manage.py test`