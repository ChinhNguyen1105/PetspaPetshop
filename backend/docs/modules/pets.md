# Pets module

## Observed routes

- `GET /pets/my-pets`, `GET /pets/{id}`, `POST /pets`, `PUT /pets`,
  `DELETE /pets/{id}`.
- `GET /admin/pets` with filters including `userId`.
- Declared but not called by a FE service: `PATCH /admin/pets/{id}/activate` and
  `/deactivate`.

Create uses the pet form payload unchanged; the full field list is not stable
enough in the service layer to make undocumented fields mandatory. Derive owner
from JWT, validate ownership on detail/update/delete and allow privileged
cross-customer access only after authorization is defined.

Pet records must be valid and owned by the customer before a booking is made.
