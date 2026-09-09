---
name: create-api
description: Implement a frontend-compatible PetSpa REST endpoint.
---

# Create an API endpoint

Inspect the exact FE service call, store consumption and relevant module doc.
Document method, canonical `/api/v1` route, auth, parameters, DTO and response.
Use a validated DTO and thin controller; derive actor identity from JWT and keep
business checks in the service. Return `{ status, message, data }`, with
`{ result, meta }` for pages.

Test success, invalid input, unauthenticated/forbidden/ownership cases, not
found and business-rule failures. Do not add undocumented route variants to
accommodate FE inconsistencies—record and coordinate them instead.
