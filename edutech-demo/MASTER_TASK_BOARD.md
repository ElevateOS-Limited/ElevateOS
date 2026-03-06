# MASTER_TASK_BOARD

## Section 0: Repo baseline (facts only)

- Current branch: `feat/rbac-funnel-a-routes`
- Last commit hash: `1bd5713`
- Repo path: `/root/.openclaw/workspace/edutech-demo`

### Local run (currently working commands)
```bash
cd /root/.openclaw/workspace/edutech-demo
npm install
npm run db:generate
npm run build
npm run dev
```

### Build status snapshot
- `npm run lint`: **FAIL**
  - Error: Next lint invalid options (`useEslintrc`, `extensions`, `resolvePluginsRelativeTo`, `ignorePath`, `rulePaths`, `reportUnusedDisableDirectives`)
- `npm run typecheck`: **FAIL** (script missing)
- `npm test`: **FAIL** (script missing)
- `npm run build`: **PASS**

### Prisma status
- Prisma schema exists: **YES** (`prisma/schema.prisma`)
- Migrations folder exists: **NO** (`prisma/migrations` missing)
- Seed script exists and runnable: **NO** (no seed file/script configured)

### Known tooling breakpoints
1. ESLint/Next config mismatch (Next 14 + newer eslint config/options conflict)
2. Missing scripts: `typecheck`, `test`
3. No migration history / no deterministic seed command

---

## Section 1: Funnel A end-to-end definition of done

### Tutor click-path (login to outcome)
1. Login as tutor
2. Open `/dashboard/quickstart`
3. Select class + student
4. Generate worksheet/test/mock from topic/difficulty
5. Assign to class/student
6. Record score from attempt
7. Generate and save monthly report
8. Review assignment/score/report history in same flow

### DB entities touched (current + target)
- Current touched: `User`, `Worksheet`, `Feedback`, `Note`
- Target to complete Funnel A: `Organization`, `Class`, `Student`, `Assessment`, `Attempt`, `LessonPlan`, `LessonSession`, `CalendarEvent`, `Report`, `Document`

### API routes touched
- Current:
  - `POST /api/worksheets/generate`
  - `POST /api/feedback`
  - `POST /api/notes`
  - `GET /api/feedback`
  - `GET /api/notes`
  - `GET /api/user/profile`
- Target additions for done state:
  - `/api/classes/*`
  - `/api/students/*`
  - `/api/assessments/*`
  - `/api/lesson-plans/*`
  - `/api/calendar-events/*` (already present, needs full wiring)
  - `/api/reports/monthly/*`

### UI pages touched
- Current:
  - `/dashboard/quickstart`
- Target complete flow pages:
  - `/dashboard/worksheets`
  - `/dashboard/planner`
  - `/dashboard/calendar`
  - `/dashboard/progress`
  - `/dashboard/student/[id]` (or equivalent profile route)

---

## Section 2: AI Integrity end-to-end definition of done

### Flow
Upload → extract text → segment → score → highlight → export PDF/DOCX → persist job/results/artifact → show under student profile

### DB entities
- Required:
  - `AiDetectionJob`
  - `AiDetectionSegment`
  - `AiDetectionReport`
  - linkage fields to `Student` and `Document`

### API routes
- Required:
  - `POST /api/ai-integrity/upload`
  - `POST /api/ai-integrity/analyze`
  - `GET /api/ai-integrity/:jobId`
  - `POST /api/ai-integrity/:jobId/export`

### UI pages
- Required:
  - `/dashboard/ai-integrity`
  - Student profile tab: `Integrity Reports`

---

## Section 3: Completed vs missing inventory

| Module | Status | Blocking gap | Files | Owner | Next commit ID |
|---|---|---|---|---|---|
| Funnel A quickstart vertical slice | Partial | Uses fallback class/student model; no class/student DB entities | `src/app/dashboard/quickstart/page.tsx` | Arby | `TBD-C1` |
| Worksheet generation core | Partial | Not fully unified with class/student/assessment pipeline | `src/app/api/worksheets/generate/route.ts`, `src/app/api/worksheets/route.ts` | Arby | `TBD-C3` |
| Assignment + score + report continuity | Partial | Event logging via feedback; no normalized attempt/report entities | `src/app/dashboard/quickstart/page.tsx`, `src/app/api/feedback/route.ts`, `src/app/api/notes/route.ts` | Arby | `TBD-C3` |
| Multi-tenant scoping correctness | Missing | orgId-based scoping wrappers/guards absent across routes | multiple `src/app/api/**/route.ts` | Arby | `TBD-C1` |
| RBAC API + UI gating | Partial | Some auth checks exist; role enforcement not consistent | `src/lib/auth/*`, `src/app/api/**/route.ts`, dashboard pages | Arby | `TBD-C2` |
| AI Integrity pipeline | Missing | No production route/UI/DB pipeline integrated | N/A (new files required) | Arby | `TBD-C3` |
| Tooling control loop files | Missing | No formal board/heartbeat/postmortem logs in repo | `MASTER_TASK_BOARD.md`, `PROGRESS_LOG.md`, `HEARTBEAT.md`, `POSTMORTEM.md` | Arby | `TBD-C1` |

---

## Section 4: Next 3 one-hour commits (pre-scoped)

### Commit 1
- **Title:** `chore(control-loop): add task board logging and org-scope guard baseline`
- **Exact files to touch:**
  - `MASTER_TASK_BOARD.md`
  - `PROGRESS_LOG.md` (new)
  - `HEARTBEAT.md` (new)
  - `POSTMORTEM.md` (new)
  - `src/lib/auth/roles.ts` (new)
  - `src/lib/db/org-scope.ts` (new)
  - `src/app/api/feedback/route.ts`
  - `src/app/api/notes/route.ts`
- **Acceptance tests:**
  1. `GET /api/feedback` still returns data
  2. `GET /api/notes` still returns data
  3. `npm run build` passes
  4. New log files exist and contain first entries
- **Rollback note:** revert commit fully; restore prior API behavior with `git revert <hash>`.

### Commit 2
- **Title:** `feat(rbac): enforce role guards on funnel-a critical api routes`
- **Exact files to touch:**
  - `src/lib/auth/roles.ts`
  - `src/app/api/worksheets/generate/route.ts`
  - `src/app/api/worksheets/route.ts`
  - `src/app/api/notes/route.ts`
  - `src/app/api/feedback/route.ts`
  - `src/app/dashboard/quickstart/page.tsx`
- **Acceptance tests:**
  1. Tutor/demo user can complete quickstart flow
  2. Unauthorized role is blocked from protected writes (403/401)
  3. `npm run build` passes
- **Rollback note:** revert commit if role mapping breaks demo login flow.

### Commit 3
- **Title:** `feat(ai-integrity): ship minimal vertical slice upload-segment-score-persist`
- **Exact files to touch:**
  - `prisma/schema.prisma`
  - `src/app/api/ai-integrity/analyze/route.ts` (new)
  - `src/lib/ai-integrity/segment.ts` (new)
  - `src/lib/ai-integrity/score.ts` (new)
  - `src/app/dashboard/ai-integrity/page.tsx` (new)
  - `src/app/dashboard/layout/sidebar-config.ts` (or existing sidebar source)
- **Acceptance tests:**
  1. Open `/dashboard/ai-integrity`
  2. Paste text + run analysis
  3. Get per-segment percentage + label + rationale in UI
  4. Job + segments persisted in DB
  5. `npm run build` passes
- **Rollback note:** revert commit and remove sidebar entry if schema or UI breaks dashboard.
