# Testing rule

For each meaningful change, test the success path and material failure paths:
invalid DTO, unauthenticated/forbidden access, ownership failure, not found and
business invariant violation. For booking, test conflict and transition rules;
for orders/inventory, test atomic stock/pricing behaviour; for payments, test
invalid callback verification.

Run focused tests plus `npm run build`; run lint without blindly applying its
auto-fix. State exactly what ran and what could not run.
