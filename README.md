# ElevateOS

ElevateOS is a Next.js App Router application for study planning, tutoring workflows, practice generation, progress tracking, and related premium student tools.

## Core product areas

- Study support: summaries, flashcards, and study plans from uploaded material
- Practice generation: worksheets and past-paper style exercises
- Planning: profile, deadlines, blocked dates, and weekly availability
- Progress: review history, weak areas, and analytics
- Premium modules: admissions and internship support, paper scan, Stripe billing

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth
- Stripe
- OpenAI / Anthropic integrations

## Local setup

1. Copy `.env.example` to `.env` and fill in the required values.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npm run db:generate`
4. Sync schema to your database: `npm run db:push`
5. Start development: `npm run dev`

Minimum required environment variables:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `OPENAI_API_KEY`

## Production verification

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `PORT=8080 npm run start`

## Auth notes

- Public signup requires both `PUBLIC_SIGNUP_ENABLED=true` and `NEXT_PUBLIC_ENABLE_SIGNUP=true` for consistent UI and API behavior.
- Password reset email delivery uses `SMTP_URL` or the `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` set. If mail is not configured, the reset request flow falls back to support instructions.

## Deployment

- App Platform runtime binds through `npm run start`, which respects `PORT` and listens on `0.0.0.0`.
- Health endpoints:
  - `/healthz`
  - `/api/health`

See `SETUP.md` and `docs/digitalocean-app-platform.md` for deployment details.
