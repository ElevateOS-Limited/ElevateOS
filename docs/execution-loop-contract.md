# ElevateOS Execution Loop Contract

This document freezes the MVP contract that the codebase should follow.

## Product Contract

ElevateOS is a tutoring execution system with one shared backend and two surfaces:

- `elevateos.org` is the IB-first AI revision layer.
- `tutoring.elevateos.org` is the premium tutoring execution layer.

The product loop is:

1. Assign
2. Submit
3. Feedback
4. Track
5. Report
6. Repeat

The MVP is intentionally narrow. It is not a generic learning platform, marketplace, or CRM.

## Core Data Model

Keep the system centered on these entities:

- Task
- Submission
- Feedback
- Weak-topic tag
- Progress metric
- Weekly parent report

The existing Prisma models already cover the underlying task, submission, feedback, resource, and relationship data. The weekly report is generated from those records and does not need a separate workflow engine.

## Surface Rules

### Public site

- Position the main site as an IB-first AI revision copilot.
- Focus on syllabus-aware practice, mark-scheme alignment, weak-topic tracking, and revision summaries.
- Keep the conversion path clear from freemium AI access to tutoring premium.

### Tutoring workspace

- Keep student, tutor, and parent views role-separated.
- Student flow: dashboard -> task -> submit -> feedback.
- Tutor flow: student list -> task assignment -> review -> weekly report.
- Parent flow: weekly report -> progress snapshot -> next step.

## AI Contract

AI should be used for:

- revision summaries
- worksheet generation
- parent-ready report compression
- weak-area suggestions

AI should not be used as a fully autonomous tutor in v1.

Structured outputs are preferred whenever a user-facing summary must be consistent.

## Security Contract

These are non-negotiable:

- Never trust client-supplied ownership or role hints.
- Scope reads and writes on the server.
- Keep file uploads private.
- Use short-lived signed upload URLs when object storage is connected.
- Validate file size, file type, and URL protocol.
- Do not reuse code from repositories without a license.

## Current Implementation Notes

Implemented in this repository:

- scoped tutoring workspace reads
- weekly parent report API
- report page in the tutoring workspace
- execution-loop positioning on the public site
- IB-first AI system prompts
- study upload guardrails

Out of scope for v1:

- marketplace behavior
- microservices
- autonomous AI tutoring
- broad admissions platform expansion
- custom storage infrastructure before a storage provider is attached

