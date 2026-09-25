# routes

`ROUTES` path constants, the route table and the private (guarded) routes.

Rules:

- Views are lazy `export default`.
- Guards from `guards/` run from here, never from a view.
- No hard-coded paths anywhere else in the app.

Must not live here: layout or business logic.
