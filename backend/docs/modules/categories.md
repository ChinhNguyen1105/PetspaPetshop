# Categories module

## Observed routes

- `GET /categories` supports at least `keyword` and `type`.
- `GET /categories/{id}`, `POST /categories`, `PUT /categories`,
  `DELETE /categories/{id}`.

The frontend expects category fields `id`, `name`, `categoryType` (or `type`),
and active state. Forms filter categories with `type=PRODUCT` or `type=SERVICE`.
Create/update body is `{ name, categoryType }` plus an `id` for update.

Reject deletion of a category still referenced by active products/services, or
use an approved soft-delete strategy. Catalogue management permissions are an
open matrix decision.
