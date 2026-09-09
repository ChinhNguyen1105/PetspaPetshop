# Database rule

No database/ORM/migration technology is selected yet. Do not add one or create
a physical schema without approval. When it is selected, implement migrations,
foreign keys, uniqueness and indexes from `docs/DATABASE.md`.

Use exact money representation, transactional order/inventory writes and an
append-only inventory movement history. Store address/price snapshots for
orders. Never expose secret persistence fields in API responses.
