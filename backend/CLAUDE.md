# PetSpa Backend — Working Instructions

## Purpose and source of truth

Build the NestJS REST API consumed by `../frontend`. The frontend currently calls
`http://localhost:8080/api/v1` and sends a Bearer token from `petspa_token`.

Use this order of evidence before changing a contract:

1. The relevant frontend service, store, page and form.
2. `docs/API.md` and the relevant `docs/modules/*.md` contract.
3. `docs/BUSINESS-RULES.md`, `docs/PRD.md`, and `docs/DATABASE.md`.
4. Existing backend code and tests.

The frontend is the observed integration contract, not permission to invent
business behaviour. If it does not establish a field, transition, permission,
or persistence choice, add or update an **Open decision** in the documentation
and ask the project owner before implementing it.

## Current project facts

- Runtime: NestJS 11 and TypeScript.
- API style: JSON REST under `/api/v1`.
- Authentication transport: `Authorization: Bearer <JWT>`.
- Backend source and database integration have not yet been implemented.
- The package manifest does not yet select an ORM, database, JWT library, or
  validation library. Do not add any of them without an approved design.

## Required response envelope

Frontend stores expect successful responses in this shape unless a module
document explicitly says otherwise:

```json
{
  "status": "SUCCESS",
  "message": "Human-readable result",
  "data": {}
}
```

List data normally uses `data.result` and `data.meta`. Error responses must
contain a safe `message`; never return a stack trace, password hash, token, or
payment secret.

## Implementation workflow

1. Read the relevant module document and frontend consumer.
2. Identify authentication, ownership, role/permission and state-transition
   requirements.
3. Implement only the affected domain module, with DTO validation at the HTTP
   boundary and business checks in its service.
4. Keep controllers thin and do not access another module's repository/table
   directly.
5. Add tests for the happy path and material rejection paths.
6. Update the API, business-rule, database and module documents whenever their
   corresponding contract changes.
7. Run the focused tests, `npm run build`, and lint without accepting automatic
   fixes blindly.

## Domain boundaries

- `auth` owns credential verification and token issuance.
- `users`, `roles` and `permissions` own identity and access management.
- `pets`, `products`, `categories` and `services` own their catalogue records.
- `bookings` owns slot conflict checking and booking status.
- `cart` owns a customer's uncommitted selection; `orders` owns committed
  purchases and order status history.
- `inventory` is the only domain that changes stock or writes stock movements.
- `payments` owns VNPay request construction and verified callback handling.
- `reviews`, `files`, `addresses`, `notifications`, and `recommendations` own
  their named concern; recommendations are read-only with respect to orders.

## Non-negotiable safeguards

- Derive user identity from the JWT, never from a client-supplied `userId` for
  an ownership decision. The booking payload currently includes `userId`; treat
  it as a frontend compatibility issue and reject mismatches.
- The server, not the browser, calculates totals, product prices, stock changes,
  slot availability and payment status.
- Verify the signed payment-provider callback before changing any payment or
  order state.
- Use a transaction for a committed order plus its items and stock reservation,
  and for a stock movement plus its resulting balance.
- Protect admin endpoints with explicit role/permission checks; hiding a page in
  the frontend is not authorization.
- Do not log credentials, access tokens, payment query signatures, or personal
  data beyond what is operationally necessary.

## Contract cautions found in the frontend

- Some service clients normalise `status: "SUCCESS"` to a boolean `success`,
  while others consume `status` directly. Return both the stable envelope above
  and the documented data shape; do not create module-specific envelopes.
- `users/profile` and `users/update-profile` are missing a leading slash in the
  frontend constant. Treat their intended canonical routes as
  `/users/profile` and `/users/update-profile`; coordinate a frontend fix if
  Axios resolves them differently in its deployment.
- The order client has no active `/orders/buy-now` call, although the constant
  exists. Do not implement a buy-now flow until its request and UI behaviour are
  defined.
- Staff form fields (`experience_years`, salary, specialties, working hours)
  have no API consumer or backend contract. They are not a user API requirement
  yet.

## Documentation and review

Documentation must describe implemented, confirmed behaviour. Materially
uncertain behaviour belongs in an **Open decisions** section, not in an API
claim. Before completion report the changed files, verification performed, and
any remaining decision that blocks implementation.
