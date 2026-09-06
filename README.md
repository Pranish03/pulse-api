## API Testing

A Postman collection is available at [`docs/pulse-api.postman_collection.json`](docs/pulse-api.postman_collection.json).

Import it into Postman, set the `base_url` and `frontend_url` collection variables, then run `Auth > SignIn` first — this API uses cookie-based sessions, so Postman will automatically store your session cookie for subsequent authenticated requests.
