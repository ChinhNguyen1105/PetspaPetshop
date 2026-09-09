# Business Rules

## Rules established by the frontend contract

- Authenticated identity comes from the Bearer JWT.
- Booking statuses: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.
- Displayed order statuses: `PENDING`, `SHIPPED`, `DELIVERED`, `CANCELLED`;
  the UI also recognises `COMPLETED`.
- Payment statuses: `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`, `REFUNDED`.
- Inventory movement types: `IMPORT`, `EXPORT`, `ADJUST`.
- User status labels: `ACTIVE`, `SUSPENDED`, `TERMINATED`.

## Server-enforced rules

1. Ignore client prices, totals, stock balance, payment status and ownership
   identifiers when they conflict with server records/JWT identity.
2. Customers may not access another customer's protected resources. Privileged
   access needs a confirmed role/permission check.
3. A booking must contain a valid owned pet, at least one valid active service,
   a valid date/time interval, and no conflict at the final write.
4. Checkout accepts selected cart-item IDs, an owned address ID and a supported
   payment method. Re-price and check stock inside the checkout transaction.
5. Inventory mutations create a movement record and reject invalid quantity or
   stock outcomes atomically.
6. A review author must be authenticated; eligibility, one-review limits and
   edit/delete policy are not yet specified and must be decided before release.
7. Only a verified VNPay callback may transition a payment to `SUCCESS` or
   otherwise affect a paid-order state.

## Open transition rules

The FE exposes values but not the allowed transition graph. Before coding,
confirm who may transition each status, whether order cancellation is allowed
after shipment/payment, and the booking cancellation window. Until confirmed,
return a deliberate validation error rather than guessing.
