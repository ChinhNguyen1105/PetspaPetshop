# PetSpa / PetShop Backend Product Requirements

## Product goal

Provide the authenticated API behind the PetSpa web application: customers
manage pets, browse products and spa services, book appointments, shop and
pay; administrators manage catalogue, users, inventory and orders.

This document is derived from the current frontend. It distinguishes observed
requirements from decisions that still need approval.

## User-facing capabilities observed in the frontend

- Account registration, login, logout and personal profile/avatar management.
- Customer addresses and a default shipping address.
- A personal pet profile with create, edit, detail and delete actions.
- Product/category/service browsing, search, detail pages, images and ratings.
- A cart, checkout from selected cart items, order history/detail and customer
  cancellation.
- VNPay payment initiation, return handling and payment-status lookup.
- Spa appointment creation for one pet and one or more services, occupied-slot
  lookup, customer cancellation and staff status updates.
- Product/service reviews and product/service recommendations from item IDs.
- Administration of users, roles, permissions, products, categories, services,
  bookings, orders and inventory movements.

## Roles exposed by the frontend

`ADMIN`, `STAFF`, and `CUSTOMER` are the displayed role names. The UI does not
define their authoritative permission matrix; the backend must therefore store
and enforce permissions explicitly once that matrix is approved.

## Business outcomes

1. A customer may only read or mutate their own profile, addresses, pets, cart,
   bookings, orders and reviews, except where a documented public read exists.
2. A booked slot must not be double-booked.
3. An order price and stock result must be determined from server-side product
   data at checkout time.
4. Every inventory change must produce an immutable movement record.
5. An order must not be marked paid from browser input; the payment provider
   callback must be verified first.

## Explicit non-goals for the first backend increment

- Microservices, event sourcing, CQRS and a generic CRUD framework.
- A buy-now checkout endpoint: the frontend declares its URL but has no call or
  request contract.
- A staff payroll/profile API: staff-only form fields lack a service contract.

## Acceptance criteria

- All endpoints actively called by FE services are available under `/api/v1`.
- Responses use the documented success/error envelope and list shape.
- DTOs reject unknown and malformed input after the validation technology is
  selected.
- Resource ownership, role/permission checks and state transitions are enforced
  server-side.
- API and module documentation remain synchronized with code.

## Open decisions requiring owner confirmation

1. Database engine, ORM/migration tooling and ID type.
2. Exact permission matrix for `ADMIN`, `STAFF`, and `CUSTOMER`.
3. Final order lifecycle, especially whether `COMPLETED` is distinct from
   `DELIVERED` and when cancellation is allowed.
4. Booking operating hours, service-buffer time, capacity/staff assignment and
   cancellation deadline.
5. Payment methods accepted at checkout, VNPay credentials/return URL and
   refund policy.
