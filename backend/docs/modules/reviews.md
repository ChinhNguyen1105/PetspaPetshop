# Reviews module

## Observed routes

- Product: `GET /product-reviews/{productId}`, `POST /product-reviews`,
  `PUT /product-reviews`, `DELETE /product-reviews/{reviewId}`.
- Service: `GET /service-reviews/service/{serviceId}`, `POST /service-reviews`,
  `DELETE /service-reviews/{id}`, average-rating and count routes.

Create requests carry a target ID, `rating` (1–5) and `comment`; an update also
needs the review ID. Product-review retrieval is expected to expose
`avgRating`, `totalReviews`, and paginated `reviews`.

The booking-review page currently sends `serviceId: bookingId`, which is
ambiguous when a booking contains multiple services. Do not encode this as a
backend rule: confirm whether a review targets a booking, each service, or both.
Eligibility (completed purchase/booking), uniqueness, moderation and edit
window are also open decisions.
