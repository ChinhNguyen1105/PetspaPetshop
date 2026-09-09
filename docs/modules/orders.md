# Orders module

## Observed routes and bodies

- `GET /orders/my-orders` accepts `page`, `size`, optional `status`, `sort`.
- `GET /orders/{id}`, `PATCH /orders/{id}/cancel`.
- `POST /orders/from-cart` accepts `{ cartItemIds, addressId, paymentMethod }`.
- `GET /admin/orders`; `PATCH /admin/orders/status` accepts
  `{ orderId, status, note }`.

List responses use `data.result`/`data.meta`. FE displays `PENDING`, `SHIPPED`,
`DELIVERED`, `CANCELLED`, and also recognizes `COMPLETED`.

## Server rules

Checkout validates cart-item and address ownership, server-side product price,
availability, and payment method. Atomically create the order/item snapshots,
status history and inventory result. Customer cancellation and admin transitions
need an approved transition graph; do not infer it from button visibility.

`/orders/buy-now` is only a declared FE constant and is deferred.
