# Bookings module

## Observed routes and body

- `GET /bookings/all`, `GET /bookings/my-bookings`, `GET /bookings/{id}`.
- `GET /bookings/occupied-times` with date/service-related query parameters.
- `POST /bookings` with `userId`, `serviceIds: number[]`, optional `petId`,
  `bookingDate` (`YYYY-MM-DD`), `startTime`, `endTime` (`HH:mm:ss`).
- `PATCH /bookings/{id}/cancel` and `PATCH /bookings/{id}/status?status=...`.

Lists use `data.result`/`data.meta`. Valid displayed statuses are `PENDING`,
`CONFIRMED`, `COMPLETED`, and `CANCELLED`.

## Server rules

Use JWT identity, not the submitted `userId`, and reject mismatches. Verify pet
ownership, service validity, positive time interval and final slot conflict in a
transaction. The confirmed transition graph, hours, cancellation deadline and
capacity/staff-assignment rules must be approved before implementation.
