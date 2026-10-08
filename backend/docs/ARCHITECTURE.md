# Architecture

## Confirmed boundary

The backend is a NestJS modular monolith exposing `/api/v1`. It is a REST API
for `../frontend`, whose Axios client sends JSON and a Bearer JWT.

## Target layout

```text
src/
  common/                 # generic guards, filters, decorators, utilities
  config/                 # validated environment configuration
  modules/
    auth/ users/ roles/ permissions/
    pets/ products/ categories/ services/ files/
    bookings/ cart/ orders/ inventory/ payments/
    addresses/ reviews/ notifications/ recommendations/
  app.module.ts
  main.ts
```

Each module owns its controller, service, DTOs, persistence adapter and tests.
Controllers convert HTTP to application calls; services enforce use cases and
state; persistence remains behind the owning module. A module may call another
module's exported application service, never its private repository.

## Cross-domain flows

```text
Cart -> Order -> Inventory reservation -> Payment -> verified provider callback
Pet + Services + date/time -> Booking -> conflict check -> Booking status
```

The order/inventory work must share an explicit transaction boundary. Payment
callback verification is outside that transaction until authenticity is known;
only then may it update payment/order state. Recommendations only read historic
signals and must not mutate an order, inventory or payment.

## API conventions

- Prefix: `/api/v1`; JSON UTF-8.
- Authenticated requests use `Authorization: Bearer <token>`.
- Return `{ status, message, data }`; collections are `{ result, meta }`.
- `meta` should expose `page`, `pageSize`, `total`, and `pages` when paginated.
- Use DTOs, global validation, safe exception mapping and explicit response
  DTOs after the supporting NestJS dependencies are approved.

## Pending technology decision

The repository currently includes only core NestJS packages. Database, ORM,
JWT implementation, validation library, storage provider, job runner and
notification transport are not selected. Keep adapters isolated; do not claim
one as implemented or add it without approval.
