# Spa services module

## Observed routes

- `GET /services`, `/services/search?keyword=...`, `/services/category/{categoryId}`.
- `GET /services/top?limit=...`, `GET /services/{id}`.
- `POST /services`, `PUT /services`, `DELETE /services/{id}`.
- `POST /services/recommendations` with `{ itemIds: number[] }`.

Create body: `{ name, description, basePrice, durationMin, categoryId }`.
Update includes `id`. FE normalises both `basePrice`/`original_price` and
`durationMin`/`duration_minutes`; the API should standardize on the camelCase
names above and return a category identifier or category object.

Only active services are bookable. Service duration must feed booking conflict
checks; staff allocation/capacity and buffers remain open decisions.
