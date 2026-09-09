# API compatibility rule

Current FE base URL is `http://localhost:8080/api/v1` and it sends a Bearer JWT.
Treat frontend service code as the observed caller contract. Preserve method,
route, body fields, query parameters, response shape and enum spelling unless
the FE is changed in the same work.

Known FE inconsistencies must not become new backend variants: profile routes
lack a leading slash, VNPay creation has two body shapes, and role clients expect
a bare list. Use the canonical route/envelope documented in `docs/API.md`, flag
the mismatch and coordinate an FE fix.
