# Notifications module

The current notification service is mock-only: it maintains browser memory and
does not issue HTTP requests. The UI shape appears to use an ID and `is_read`
flag, but no API path, authorization, persistence or delivery requirement is
defined.

Do not implement notification endpoints merely from this mock. Confirm which
events notify whom, delivery channels, read/archive semantics, retention and
whether real-time updates are required.
