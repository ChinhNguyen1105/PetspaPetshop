# Shipping addresses module

## Observed routes and payload

- `GET /shipping-addresses`
- `POST /shipping-addresses` with `fullName`, `phone`, `province`, `district`,
  `ward`, `addressDetail`, `isDefault`.
- `PUT /shipping-addresses` with `id` plus address fields.
- `DELETE /shipping-addresses/{id}`
- `PATCH /shipping-addresses/{id}/default`

Addresses belong to the authenticated customer. Set-default must atomically
clear the previous default for that customer. An order must store an address
snapshot, not rely on a mutable address after checkout.
