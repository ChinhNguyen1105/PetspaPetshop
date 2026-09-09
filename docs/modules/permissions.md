# Permissions module

## Observed routes and body

`POST /permissions`, `PUT /permissions`, `GET /permissions`,
`GET /permissions/{id}`, and `DELETE /permissions/{id}`. Payload:
`{ id?, name, apiPath, method, module }`.

Only authorized administrators may manage permissions. Validate HTTP method,
canonical API path and uniqueness appropriate to the selected permission model.
The frontend lists/edits permission records but does not define which role owns
which capability; document and seed that matrix before using permissions for
production access control.
