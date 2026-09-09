# Database Design Status

## Important status

No database engine, ORM, migration tool or backend entity currently exists in
this repository. This file records the conceptual data model required by the
frontend; it is **not an approved physical schema**. Select the database and
migration approach before creating tables or entities.

## Conceptual aggregates

- Identity: `User`, `Role`, `Permission`, role-permission assignment.
- Customer data: `Pet`, `ShippingAddress`, `Cart`, `CartItem`.
- Catalogue: `Category`, `Product`, `ProductImage`, `Service`, `ServiceImage`.
- Operations: `Booking`, booking-service assignment, `Inventory`,
  `InventoryTransaction`, `Order`, `OrderItem`, `OrderStatusHistory`.
- Trust/payment: `ProductReview`, `ServiceReview`, `Payment`.
- Supporting: notification and recommendation input/output records if required.

## Required ownership/relations

- A user owns pets, addresses, one active cart, bookings, orders and authored
  reviews.
- A product and a service belong to a category and can have many images.
- A booking references one pet and one or more services.
- An order has immutable order items and one delivery address snapshot; do not
  make historical orders depend on a mutable address record.
- Inventory has one current balance per product and many append-only
  transactions.
- A payment belongs to an order and stores provider references/signature data
  securely, never exposes secrets to API responses.

## Integrity requirements

- Email must be unique; password hashes never leave persistence responses.
- Enforce foreign keys/ownership and indexes for common list filters.
- Store money in an integer minor unit or an exact decimal type; never binary
  floating point. The currency/scale must be approved.
- Prevent negative stock except when a specifically approved adjustment reason
  permits it.
- Enforce booking conflict checks in a transaction/locking strategy suitable for
  the selected database.
- Keep audit timestamps and status history where the frontend needs operational
  traceability.

## Decisions needed before migrations

Database/ORM, primary-key strategy, timezone convention, money currency/scale,
soft-delete policy, retention/privacy policy, and the final role/permission
seed data are all unconfirmed.
