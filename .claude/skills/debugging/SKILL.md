---
name: debugging
description: Diagnose a PetSpa frontend-to-backend integration defect.
---

# Debug an integration defect

Reproduce with the exact method, URL, headers, query and JSON/multipart body
sent by the FE service. Follow the response through the store to identify shape
or field mismatches. Check auth/ownership, DTO validation, status transitions
and persistence boundaries before changing code.

Prefer a minimal compatibility fix. If the FE contract is internally
inconsistent (such as the two VNPay create bodies), identify both callers and
request a canonical decision rather than silently supporting divergent behavior.
