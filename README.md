# ElevateOS

ElevateOS is a tutoring execution platform for IB students. It connects tutors, students, and parents through a shared workflow — assignments, submissions, feedback, session notes, and progress reports — without the overhead of chat history or scattered documents.

## Architecture

Three roles, three views, one codebase.

| Role | Route | Capabilities |
|------|-------|-------------|
| Tutor | `/tutor-dashboard` | Assign tasks, review submissions, write session notes, generate parent reports |
| Student | `/student-dashboard` | View tasks, submit work, read feedback and session notes |
| Parent | `/student-dashboard` | Read-only view of student progress and tutor feedback |

Admin/Owner roles have access to `/admin` for user and platform management.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js with Google OAuth + email/password
- **Styling**: Tailwind CSS
- **Hosting**: DigitalOcean App Platform
- **CI**: GitHub Actions (type check, lint, CodeQL)

## Project Structure

```
src/
├── app/
│   ├── admin/               # Admin dashboard
│   ├── student-dashboard/   # Student view (tasks, feedback, notes)
│   ├── tutor-dashboard/     # Tutor view (students, tasks, reports)
│   ├── api/
│   │   ├── tutoring/        # Tutoring domain API (tasks, submissions, feedback, notes, reports)
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── user/            # User management
│   │   └── profile/         # Profile updates
│   ├── auth/                # Sign-in/out pages
│   ├── home/                # Public landing
│   ├── login/               # Login page
│   └── onboarding/          # Role selection on first login
├── components/
│   ├── tutoring/            # Tutor dashboard shell and page components
│   ├── public/              # Public-facing components
│   └── ui/                  # Shared UI primitives
└── lib/
    ├── auth/                # Session helpers, role routing, RBAC
    ├── tutoring/            # Tutoring domain logic and mock data
    └── db/                  # Database utilities and RLS helpers
```

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm run dev
```

The app runs in demo mode when `DATABASE_URL` is not set — no database required to preview the UI.

## Demo Mode

Set `DEMO_MODE=true` (or leave `DATABASE_URL` unset) to run with mock data. All three role views are accessible without authentication.

## Environment Variables

See `.env.example` for required variables. At minimum you need:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_URL` — Base URL of the deployment
- `NEXTAUTH_SECRET` — Random secret for session signing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth credentials

## Deployment

Deployed via DigitalOcean App Platform. Push to `main` triggers an automatic build.
