# Payments module

## Observed VNPay routes

- `POST /payment/vnpay/create?orderId=...` is called by `VNpayService`.
- The order client also posts `{ orderId, paymentMethod }` to the same route.
- `GET /payment/vnpay/return` forwards all VNPay callback query parameters.
- `GET /payment/vnpay/status?orderId=...` checks an order's payment state.

The create-route request shape is inconsistent between two FE services. Accept
only one canonical design after owner confirmation, then align FE. The response
must provide the redirect/payment information actually consumed by the checkout
flow without exposing provider secrets.

Verify callback signatures and amount/order correlation server-side. Browser
return URLs are informational; a payment/order may change state only after a
verified provider notification. Final VNPay configuration, return URL, refund
process and allowed payment methods are open decisions.
