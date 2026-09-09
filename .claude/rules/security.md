# Security rule

Authenticate with the Bearer JWT and authorize every protected operation by
role/permission and resource ownership. Frontend route guards are never enough.
Validate all external input and whitelist accepted DTO fields.

Never log or return passwords, hashes, access tokens, payment signatures,
provider credentials or unnecessary personal data. Verify VNPay callbacks
server-side before payment/order mutation. Validate uploaded file type, size and
ownership before storing or serving it.
