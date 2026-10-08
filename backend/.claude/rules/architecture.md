# Architecture rule

Use a modular monolith under `src/modules/<domain>`. Keep controllers thin,
DTOs at the boundary, use-case/business logic in services, and persistence
behind the owning module. Cross-domain coordination uses another module's
exported service, not its repository/table.

`inventory` alone changes stock; `bookings` owns conflict/status rules;
`payments` owns verified provider callbacks; `orders` owns committed purchases.
Use transactions for checkout/inventory consistency. Do not introduce
microservices, CQRS, event buses or generic CRUD abstractions without approval.
