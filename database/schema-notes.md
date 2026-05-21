# TorqueIQ Nexus SQLite Tables

- `users`: authentication records for customers, staff, and the protected Boss account.
- `login_history`: signup/login audit trail with timestamps and user identity.
- `vehicles`: customer owned vehicle profiles.
- `repairs`: service lifecycle, bills, AI estimates, mechanic assignment, and completion status.
- `complaints`: customer complaints, service requests, emergency requests, and Boss replies.
- `products`: marketplace items for car and bike products.
- `product_photos`: multi-photo product gallery storage.
- `payments`: payment amount, method, status, transaction ID, UTR number, screenshot, and invoice.
- `messages`: customer/support/admin messaging.
- `analytics_reports`: analytics snapshot storage for generated business metrics.

The SQLite database file is `database/torqueiq.sqlite`. No demo customer, repair, payment, or product data is required for the platform to run.
