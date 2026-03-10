# AGENTS.md
Codex review rules and execution invariants for **ElevateOS Demo**

This repository uses a strict control loop defined in `MASTER_TASK_BOARD.md`.  
All pull requests must be evaluated against the system invariants below.

Reviewers must prioritize **data correctness, tenant isolation, and end-to-end flow integrity** over stylistic concerns.

---

# 1. Core principle

This repo is developed through **stitched vertical slices**.

A PR should:
- complete a defined slice from `MASTER_TASK_BOARD`
- preserve tenant isolation
- preserve RBAC enforcement
- preserve working build state

A PR should **never**:
- introduce new surface area before previous slice wiring is complete
- weaken tenant isolation or role enforcement
- introduce placeholder logic

---

## 1A. Autopilot execution contract (authoritative)

Execution is autonomous and iterative:

Implement -> Push -> Gate -> Patch -> Gate (loop) until `merge verdict: APPROVE`.

Once approved:
1. Open the next Funnel A production-code PR immediately.
2. Post the next part plan in that new PR.
3. Continue the same loop without waiting for manual GitHub actions from the user.

Required in PR operations:
- Use `/funnel-a gate` to trigger governance gate rerun when needed.
- Expect `[ARBY:COMMAND_ACK]` after command-triggered gate runs.
- Treat the latest `merge verdict:` as source of truth.
- Treat `[ARBY:NEXT_TASK]` as automatic move-to-next-part signal after approval.
- Treat supervisor escalation markers as hard actions:
  - `[AUTOPILOT:FUNNEL_A][CLAIM_MISMATCH]`
  - `[AUTOPILOT:FUNNEL_A][LOG_ONLY_BREACH]`
  - `[AUTOPILOT:FUNNEL_A][RETIRED_PR]`
  - `[AUTOPILOT:FUNNEL_A][NO_ACTIVE_PR]`
  - `[AUTOPILOT:FUNNEL_A][AUTO_ACTIVE_ASSIGN]`

Required WhatsApp status cadence (every 60 minutes, evidence only):
- `lane` or `part/task`
- `part`
- `commit`
- `files changed`
- `gate run url`
- `merge verdict`
- `blockers`
- `next action (next 60 min)`

Status updates must not include tool/runtime excuses; only verifiable artifacts.

Communication endpoint routing (effective 2026-03-10):
- OpenClaw comm-agent WhatsApp endpoint: `+85291055996`
- Human operator WhatsApp endpoint: `+85293442294`
- VPS operational identity endpoint: `+819091451428`

---

# 2. Hard blockers (automatic review failure)

Reject PR if ANY of the following appear.

## Tenant isolation violation
All tenant data must be scoped by `orgId`.

Required rules:
- Prisma queries must include `orgId` filter
- API routes must derive orgId from session
- orgId must never be accepted directly from client

Violations:
- `findMany()` or `update()` without org filter
- trusting client orgId

---

## RBAC enforcement missing
All write routes must enforce roles.

Roles defined in:
src/lib/auth/roles.ts


Server must enforce:
- owner
- admin
- tutor
- parent
- student

UI gating alone is **not sufficient**.

Example violation:


if (session.user.role === "tutor") { ... }


without server validation.

---

## Placeholder logic shipped
Reject if any of these appear:


TODO
FIXME
placeholder
lorem
mock data in production path


Demo mode flags are allowed only if they **do not bypass RBAC or tenant scoping**.

---

## Broken control loop
Reject PR if:

- `MASTER_TASK_BOARD.md` updated incorrectly
- logging files removed
- commit bypasses defined slice sequencing

Required files:


MASTER_TASK_BOARD.md
PROGRESS_LOG.md
HEARTBEAT.md
POSTMORTEM.md


---

# 3. Funnel A invariants

Reference: Section 1 of `MASTER_TASK_BOARD.md`.

Minimum working flow must remain intact:

Tutor flow:


login
→ /dashboard/quickstart
→ select class + student
→ generate worksheet
→ assign
→ record score
→ generate monthly report
→ review history


Reviewers must verify that the PR does not break this path.

---

## Funnel A entity model

Required entities for completion:


Organization
Class
Student
Assessment
Attempt
LessonPlan
LessonSession
CalendarEvent
Report
Document


Reject PR if schema changes break compatibility.

---

## Funnel A critical routes

Routes must enforce:

- RBAC
- orgId scoping
- validation

Critical endpoints:


/api/worksheets/generate
/api/worksheets
/api/feedback
/api/notes
/api/classes/*
/api/students/*
/api/assessments/*
/api/reports/monthly/*


---

# 4. AI Integrity module invariants

Reference: Section 2 of `MASTER_TASK_BOARD.md`.

Pipeline must follow:


Upload
→ Extract text
→ Segment
→ Score
→ Highlight
→ Export
→ Persist job
→ Link to student profile


Reject PR if any step is skipped.

---

## Required database entities


AiDetectionJob
AiDetectionSegment
AiDetectionReport


Each job must include:


jobId
studentId
documentId
status
createdAt


Segments must include:


segmentText
score
label
confidence
rationale


---

## Idempotency requirement

Running analysis twice must **not duplicate segments or reports**.

Job reruns should update existing records.

Reject PR if duplicate rows are possible.

---

# 5. Export requirements

Exports must include:


PDF
DOCX


Exports must contain:

- title
- student
- date
- overall score
- segment breakdown
- disclaimer

Reject PR if export produces empty file or placeholder content.

---

# 6. Logging protocol

Control-loop files are required artifacts and must remain present:

- `PROGRESS_LOG.md`
- `HEARTBEAT.md`
- `POSTMORTEM.md`

Liveness for autonomous execution is evaluated primarily from:
- commit activity on active Funnel A PR
- governance gate verdict activity
- 60-minute evidence status updates (WhatsApp + PR command loop)

Reject if control-loop files are removed or if telemetry is demonstrably false.

---

# 7. Code quality expectations

Prefer:

- shared utilities
- small composable functions
- typed inputs
- consistent error responses

Avoid:

- magic constants
- duplicated logic
- hidden side effects

---

# 8. Tooling expectations

The following must remain functional:


npm run build


Lint/test scripts may fail temporarily (known baseline issue) but **must not regress further**.

Known baseline issues:


Next lint config mismatch
missing typecheck script
missing test script


---

# 9. What approval means

Approve only if:

1. RBAC is enforced server-side
2. orgId isolation is correct
3. vertical slice remains functional
4. no placeholders exist
5. database writes are deterministic
6. build succeeds

If any invariant is uncertain, request changes.

---

# 10. Review philosophy

Codex should review with the mindset:

**This is a multi-tenant SaaS.**

Primary risks are:

- tenant data leakage
- role privilege escalation
- broken end-to-end product flow

Focus on those first.
