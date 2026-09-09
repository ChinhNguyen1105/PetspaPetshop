# Roles module

## Observed routes and body

`POST /roles`, `PUT /roles`, `GET /roles`, `GET /roles/{id}`, and
`DELETE /roles/{id}`. Create/update payload is
`{ id?, name, description, permissions: [{ id }] }`.

Role lists are consumed as a direct `{ result, meta }` object by the FE store,
which conflicts with the application-wide response envelope. Return the
standard envelope and align the FE adapter during integration.

Do not allow removal or mutation of a role still assigned to users without an
approved reassignment policy. The concrete permission matrix is not yet defined.
