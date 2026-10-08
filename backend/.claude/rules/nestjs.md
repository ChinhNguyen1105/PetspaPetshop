# NestJS rule

Use feature modules, DI, DTO validation, guards and safe Nest exceptions. Apply
a global `/api/v1` prefix and return `{ status, message, data }`; collections
are `{ result, meta }`. Do not expose entities, password hashes, tokens or
provider secrets.

Extract the authenticated user from a guard/decorator and enforce resource
ownership in the service. Do not trust client-supplied user IDs, status values,
totals, prices or stock quantities for authorization or final state.
