---
name: create-module
description: Add one PetSpa NestJS domain module without breaking FE contracts.
---

# Create a domain module

1. Read `CLAUDE.md`, the relevant FE consumer and module document.
2. Confirm the domain boundary, routes, DTOs, ownership and dependencies.
3. Create only required NestJS module/controller/service/DTO/test files under
   `src/modules/<domain>`.
4. Export a narrow public service API; do not expose repositories.
5. Add authorization, validation, response mapping and focused tests.
6. Update API, business-rule, database and module docs. Stop for owner input if
   persistence technology, permissions or lifecycle is still undefined.
