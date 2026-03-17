# P0 Patched Endpoints Manifest

Generated: 2026-03-17 (Asia/Tokyo)

## Ownership-safe mutation patches

| Endpoint | Method | Patch | Audit log |
|---|---|---|---|
| `/api/notes` | `PATCH` | `prisma.note.updateMany({ where: { id, userId }})` | yes |
| `/api/notes` | `DELETE` | `prisma.note.deleteMany({ where: { id, userId }})` | yes |
| `/api/goals` | `PATCH` | `prisma.goal.updateMany({ where: { id, userId }})` | yes |
| `/api/deadlines` | `PATCH` | `prisma.deadline.updateMany({ where: { id, userId }})` | yes |
| `/api/flashcards/cards` | `PATCH` | `prisma.flashcard.updateMany({ where: { id, userId }})` | yes |
| `/api/flashcards/cards` | `DELETE` | `prisma.flashcard.deleteMany({ where: { id, userId }})` | yes |
| `/api/flashcards/cards` | `POST` | deck ownership validation (`deckId + userId`) | yes |

## Stripe correctness patches

| Endpoint | Method | Patch |
|---|---|---|
| `/api/stripe/webhook` | `POST` | event-id idempotency replay check + persisted status (`received/processed/failed`) |
| `/api/stripe/reconcile` | `POST` | protected reconciliation trigger against Stripe source of truth |
| `/api/profile` | `GET` | refresh billing state on account load |
| `/api/user/profile` | `GET` | refresh billing state on account load |

## AI timeout/circuit/error-classification patches

| Endpoint | Method | Patch |
|---|---|---|
| `/api/chat` | `POST` | OpenAI timeout/circuit wrapper + classified error response |
| `/api/papers/grade` | `POST` | OpenAI timeout/circuit wrapper + classified error response |
| `/api/study` | `POST` | classified AI failure response |
| `/api/study/generate` | `POST` | classified AI failure response |
| `/api/worksheets` | `POST` | classified AI failure response |
| `/api/worksheets/generate` | `POST` | classified AI failure response |
| `/api/admissions` | `POST` | classified AI failure response |
| `/api/admissions/analyze` | `POST` | classified AI failure response |
| `/api/admissions/essay` | `POST` | classified AI failure response |
| `/api/internships` | `POST` | classified AI failure response |
| `/api/internships/recommend` | `POST` | classified AI failure response |
| `/api/extracurriculars/score` | `POST` | classified AI failure response |

## Shared P0 support modules

- `src/lib/audit.ts`
- `src/lib/ai/resilience.ts`
- `src/lib/ai/http.ts`
- `src/lib/stripe/webhook-events.ts`
- `src/lib/stripe/reconcile.ts`

## Evidence references

- Endpoint scan log: `docs/p0-endpoint-scan.log`
- Route integration tests: `tests/p0-routes.spec.ts`
- Script-level regression tests: `scripts/p0-tests.ts`
