# General project rule

This is a NestJS backend for `../frontend`. Inspect the relevant frontend
service, store and form plus `docs/modules/<domain>.md` before changing a
contract. Prefer evidence over assumptions. If a field, permission, lifecycle
or persistence decision is not established, document it as an open decision and
ask the owner; do not silently invent it.

Make the smallest coherent change. Preserve user changes, avoid unrelated
refactors and new dependencies, and run focused verification before claiming
completion. Update the matching API/business/database/module documents with any
confirmed contract change.
