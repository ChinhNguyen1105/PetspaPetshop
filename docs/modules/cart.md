# Cart module

## Observed routes and bodies

- `GET /cart`, `DELETE /cart`.
- `POST /cart-items` with `{ productId, quantity }`.
- `PUT /cart-items` with `{ itemId, quantity }`.
- `DELETE /cart-items/{id}`.

The cart store requires `status: "SUCCESS"` and data containing `itemDtoList`,
`totalAmount`, and `totalItem`. Cart items must be scoped to JWT identity.

Cart values are an estimate only. Validate product availability and positive
quantity on every change; calculate prices/totals on the server and revalidate
again during checkout. Do not decrement permanent stock when adding to cart
unless a separately approved reservation design is introduced.
