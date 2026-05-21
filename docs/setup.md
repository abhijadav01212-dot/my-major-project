# TorqueIQ Nexus Setup

Project brand: Provided by Abhishek Jatav

## Requirements

- Node.js 20+
- Optional Python with pandas/scikit-learn for offline analytics training

## Environment

Copy `backend/.env.example` to `backend/.env` and update values.

Boss account is bootstrapped on API startup:

- Boss ID: `boss2026`
- Password: `boss@2026`
- Secret code: `8813`

Accounts Department account is bootstrapped on API startup:

- Accounts ID: `account2026`
- Password: `account@2026`

Every new customer receives a permanent 8-character Customer ID. Accounts can create smart bills, approve payments, and generate GST invoice PDFs with QR and WhatsApp links.

## Run

```bash
npm install
npm run install:all
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000
