---
name: testing
description: Verify PetSpa backend behavior and integration compatibility.
---

# Test a change

Test observable FE compatibility first: route, body/query names, envelope,
pagination and enum values. Test DTO rejection, authentication, authorization,
ownership and not-found behavior. Add domain cases: overlapping booking,
invalid state change, insufficient stock, atomic checkout/movement and invalid
payment callback when applicable.

Run focused Jest tests and `npm run build`; record commands/results and any
environment limitation.
