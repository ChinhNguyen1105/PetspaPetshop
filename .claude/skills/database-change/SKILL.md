---
name: database-change
description: Safely plan a PetSpa persistence change.
---

# Plan a database change

The database/ORM is not selected. First obtain approval; then inspect
`docs/DATABASE.md` and all module consumers. Specify migration forward/rollback,
constraints, indexes, backfill and deployment order. Preserve order address and
price snapshots, use exact money representation, and atomically write inventory
movement with balance updates.

Never merge a schema assumption as a fact. Update conceptual and physical docs,
and verify migration behavior against a disposable database.
