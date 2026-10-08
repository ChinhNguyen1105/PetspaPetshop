# Inventory module

## Observed routes and body

- `GET /inventories`, `GET /inventories/transaction-history` with filters.
- `POST /inventories/import`, `/export`, `/adjust`.
- Movement body: `{ productId, quantity, note }`; the client dispatches by
  `type` (`IMPORT`, `EXPORT`, `ADJUST`).

Inventory list/transaction responses use `status: "SUCCESS"` and
`data.result`/`data.meta`. The administration form treats `ADJUST.quantity` as
the new on-hand balance; import/export quantities are deltas. It requires a
non-empty note.

Only inventory changes stock. Atomically write an append-only movement and new
balance, reject export beyond stock and validate positive quantities. Define
whether adjustments may set stock to zero and the authorization/audit policy.
