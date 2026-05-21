# TorqueIQ Nexus

AI powered car service and repair analytics platform.

Brand line: **Provided by Abhishek Jatav**

## What Is Included

- Customer and staff signup/login with JWT sessions and hashed passwords.
- Boss account bootstrap: `boss2026` / `boss@2026`.
- Accounts Department bootstrap: `account2026` / `account@2026`.
- Secret-code protection for Boss password change and system reset: `8813`.
- Clean login/signup authentication with role-based sessions.
- Unique 8-character Customer ID generation for every customer account.
- Customer vehicle garage, repair requests, photo uploads, complaints, feedback, bills, and completion confirmation.
- Mechanic dashboard for accepting jobs and updating repair progress.
- Boss dashboard for complaints, staff, customers, login history, payments, inventory, revenue, analytics, and protected actions.
- Dedicated Accounts dashboard for billing, GST invoices, payment approvals, transaction history, and revenue/GST analytics.
- Product marketplace for engine oil, batteries, indicators, tyres, brake pads, repair kits, car accessories, and bike accessories.
- Payment workflow with UPI, Card, Cash, Net Banking, transaction ID, UTR, screenshot upload, approval status, and invoice number.
- Automatic GST invoice generation with PDF download, printable bill details, QR code payloads, and WhatsApp invoice/support links.
- AI repair estimate, health score, recommendations, and analytics insights.
- Python/Pandas analytics and Scikit-learn training scaffolds for real exported data.

No customer, vehicle, repair, complaint, payment, feedback, or staff data is seeded. Dashboards populate only after real accounts and workflow activity are created.

## Local URLs

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health

## Setup

```bash
npm install
npm run install:all
```

Copy or edit `backend/.env`:

```env
PORT=5000
SQLITE_PATH=../database/torqueiq.sqlite
JWT_SECRET=change_this_long_random_secret
JWT_EXPIRES_IN=7d
BOSS_ID=boss2026
BOSS_PASSWORD=boss@2026
ACCOUNTS_ID=account2026
ACCOUNTS_PASSWORD=account@2026
SECRET_CODE=8813
GARAGE_PHONE=+919999999999
FRONTEND_URL=http://localhost:5173
```

Run both apps:

```bash
npm run dev
```

## Folder Structure

- `frontend/`: React, Tailwind CSS, Framer Motion, Chart.js UI.
- `backend/`: Node.js, Express.js, JWT auth, route controllers, middleware, and SQLite persistence.
- `backend/src/controllers/`: business workflow handlers.
- `backend/src/routes/`: API route definitions.
- `backend/src/middleware/`: auth, role protection, secret-code checks, uploads, errors.
- `backend/src/database/sqlite.js`: creates the permanent SQLite database, tables, indexes, Customer IDs, Boss account, and Accounts account.
- `backend/src/services/`: AI estimation logic plus invoice PDF/QR/WhatsApp generation.
- `database/`: permanent SQLite database file and schema notes.
- `analytics/`: Python/Pandas analytics scaffold.
- `ai-modules/`: Scikit-learn model training scaffold.
- `uploads/`: uploaded issue and repair proof photos.
- `docs/`: setup notes and verified UI screenshot.

## Technologies

React.js, Tailwind CSS, Framer Motion, Chart.js, Node.js, Express.js, SQLite, JWT, bcrypt, Multer, Python, Pandas, Scikit-learn.
