# Users module

## Observed routes

- `GET /users` and `GET /users/{id}`: admin list/detail, with query filters.
- `POST /users`: admin creates `{ email, password, name, dateOfBirth, gender, role: { id } }`.
- `PUT /users`: admin updates the same structure plus `id`.
- `PATCH /users/{id}/status`, `DELETE /users/{id}`.
- `GET /users/current`, `GET /users/profile`, `PUT /users/update-profile`.
- `POST /users/{id}/avatar`: multipart field `file`.

## Response fields consumed by FE

User data includes `id`, `name`, `email`, `dateOfBirth`, `gender`, `role`,
`avatarUrl`, and status. Lists use `data.result`/`data.meta`. The client forms
avatar URLs as `/upload/avatars/{avatarUrl}`; decide whether APIs return a key
or an absolute URL and make FE consistent.

## Authorization

Profile routes operate on JWT identity. Admin actions require approved
permissions. Do not permit role/status/avatar changes through self-profile
updates unless that policy is explicitly approved.
