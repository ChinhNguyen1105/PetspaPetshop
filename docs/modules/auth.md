# Auth module

## Observed routes

- `POST /auth/register` receives `name`, `email`, `password`, `confirmPassword`.
- `POST /auth/login` receives the login form credentials (email/password).
- `POST /auth/logout` is called with the current Bearer token.
- FE expects login data at `data.user` and `data.accessToken`.

## Rules

Validate email and confirmation password; hash passwords; never return a hash.
On logout, define whether tokens are stateless or revoked—FE only clears local
storage. Token expiry/refresh-token policy is an open decision.
