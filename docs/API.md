# API Contract

## Base contract

- Base URL: `http://localhost:8080/api/v1` in the current FE configuration.
- Content type: `application/json`, except explicit multipart uploads.
- Authentication: `Authorization: Bearer <accessToken>` for protected routes.
- Standard success: `{ "status": "SUCCESS", "message": "...", "data": ... }`.
- Standard list data: `{ "result": [], "meta": { "page", "pageSize", "total", "pages" } }`.
- Errors use an appropriate HTTP status and a safe `message` field.

## Endpoint inventory

The authoritative detailed request/response notes are in `docs/modules/`.

| Domain | Routes observed in FE |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout` |
| Users | `/users`, `/users/{id}`, `/users/current`, `/users/profile`, `/users/update-profile`, `/users/{id}/avatar` |
| Catalogue | `/products`, `/categories`, `/services`, image routes |
| Pets/booking | `/pets`, `/pets/my-pets`, `/admin/pets`, `/bookings` |
| Commerce | `/cart`, `/cart-items`, `/shipping-addresses`, `/orders`, `/admin/orders` |
| Ops | `/inventories`, `/roles`, `/permissions`, review routes |
| Payment | `/payment/vnpay/create`, `/return`, `/status` |

## Compatibility notes

Some FE clients expect `status === "SUCCESS"`; others wrap that as `success`.
Return the standard envelope consistently. A route string missing a leading `/`
in an FE constant is documented as its intended canonical root route, but the
FE should be corrected during integration testing.

## Unimplemented/deferred constants

`/forget-password/*`, `/orders/buy-now`, menu endpoints, notifications and
admin review listing are constants or UI concepts without a complete active FE
request contract. Do not publish them as complete APIs until their payload,
authorization and response needs are defined.
