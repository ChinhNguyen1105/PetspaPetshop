# Products module

## Observed routes and query

- `GET /products` supports `keyword`, `categoryId`, `status`, `sortBy`,
  `sortDirection`, and pagination.
- `GET /products/{id}`, `POST /products`, `PUT /products`, `DELETE /products/{id}`.
- `POST /products/recommendations` receives `{ itemIds: number[] }`.

Admin create payload is `{ name, description, price, categoryId, quantity }`.
Update adds `id`. The UI reads product `id`, name, description, price,
category/categoryId, stock quantity, status, thumbnail/images, average rating
and review count.

The service must calculate availability from inventory; never accept a browser
stock balance or catalogue status as authoritative. Price must be re-read at
checkout, while order items retain a historical price snapshot.
