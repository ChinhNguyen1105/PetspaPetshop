# PetSpa Backend

NestJS REST API for the PetSpa/PetShop frontend in `../frontend`.

## Current status

The repository contains the NestJS scaffold and the frontend-derived backend
contract. Domain source code, database/ORM integration, JWT implementation and
validation dependencies have not been selected or implemented yet. See
[`docs/PRD.md`](docs/PRD.md) and [`docs/DATABASE.md`](docs/DATABASE.md) before
starting a feature.

## Frontend integration contract

- Development base URL: `http://localhost:8080/api/v1`.
- Protected requests use `Authorization: Bearer <accessToken>`.
- Success envelope: `{ status: "SUCCESS", message, data }`.
- Paginated collections: `data.result` and `data.meta`.

Read [`docs/API.md`](docs/API.md) and the matching file in
[`docs/modules/`](docs/modules/) for endpoint-specific fields and known FE
inconsistencies.

## Documentation map

- [`docs/PRD.md`](docs/PRD.md): product scope and open product decisions.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): target modular-monolith shape.
- [`docs/BUSINESS-RULES.md`](docs/BUSINESS-RULES.md): server-side invariants.
- [`docs/DATABASE.md`](docs/DATABASE.md): conceptual model and migration gates.
- [`CLAUDE.md`](CLAUDE.md): agent instructions for safe implementation.

## Local commands

```bash
npm install
npm run start:dev
npm run test
npm run build
npm run lint
```

`npm run lint` currently passes ESLint's `--fix` flag. Review its diff before
keeping any formatting change.

## Before implementing persistence or security

Obtain confirmation for the database/ORM, migration flow, JWT/refresh policy,
permission matrix, booking capacity/cancellation rules, order transition graph,
and VNPay configuration/refund policy. These are deliberately marked as open
decisions in the documentation rather than guessed.






src/
│
├── main.ts
├── app.module.ts
│
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── dto/
│   ├── entities/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── utils/
│   └── validators/
│
├── config/
│   ├── index.ts
│   └── validation.ts
│
├── database/
│   ├── data-source.ts
│   ├── migrations/
│   └── seeds/
│
└── modules/
    │
    ├── auth/
    │
    ├── users/
    │
    ├── roles/
    │
    ├── permissions/
    │
    ├── pets/
    │
    ├── catalogue/
    │
    ├── cart/
    │
    ├── orders/
    │
    ├── inventory/
    │
    ├── bookings/
    │
    ├── shipping/
    │
    ├── payments/
    │
    ├── reviews/
    │
    ├── files/
    │
    ├── menu/
    │
    └── recommendation/