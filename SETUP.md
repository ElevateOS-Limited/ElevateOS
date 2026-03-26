# ElevateOS Setup Guide

This guide assumes Windows with PowerShell and PostgreSQL.

## Prerequisites

- Node.js 22.x
- PostgreSQL 15+ running locally
- An `.env` file created from `.env.example`

## 1. Create the database

```sql
CREATE DATABASE elevateos;
```

Then set:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/elevateos"
```

## 2. Configure environment variables

Copy `.env.example` to `.env`, then set at minimum:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/elevateos"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-this-with-a-long-random-string"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PUBLIC_SIGNUP_ENABLED="false"
NEXT_PUBLIC_ENABLE_SIGNUP="false"
```

Optional integrations:

- Google auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, price IDs
- Password reset email: `SMTP_URL` or `SMTP_HOST` + `SMTP_PORT` + `SMTP_USER` + `SMTP_PASS`

## 3. Install and generate

```powershell
npm install
npm run db:generate
npm run db:push
```

## 4. Run locally

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. Production checks

Run these before shipping:

```powershell
npm run lint
npm run typecheck
npm run build
$env:PORT=8080
npm run start
```

## 6. Demo mode

To enable demo mode:

```env
DEMO_MODE="true"
NEXT_PUBLIC_DEMO_MODE="true"
DEMO_USER_EMAIL="demo@elevateos.org"
DEMO_USER_PASSWORD="demopassword123"
NEXT_PUBLIC_DEMO_USER_EMAIL="demo@elevateos.org"
NEXT_PUBLIC_DEMO_USER_PASSWORD="demopassword123"
```

## Notes

- Health check endpoints are `/healthz` and `/api/health`.
- Password reset links expire after one hour.
- If SMTP is not configured, reset requests return support guidance instead of sending email.
