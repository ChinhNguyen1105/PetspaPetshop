---
name: code-review
description: Review PetSpa backend changes before merge.
---

# Review checklist

Check frontend contract compatibility, validated DTOs, ownership/permission
checks, safe response/error content, module boundaries and documentation. Verify
that stock/order writes are transactional, booking conflicts are authoritative,
and payments rely on a verified callback. Ensure tests cover important failures.

Report only actionable findings with evidence; call out unapproved assumptions
as questions and do not recommend unrelated refactors.
