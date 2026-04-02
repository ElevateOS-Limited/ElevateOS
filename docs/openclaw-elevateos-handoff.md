# OpenClaw / Claude Code Handoff

Published: 2026-03-30

This note is the repo-visible handoff for the ElevateOS MVP write surface. It exists so collaborators, OpenClaw, and Claude Code can use the same operating assumptions.

## OpenClaw write surface

- Real checkout: `/home/edwardthevaporizer_gmail_com/elevateos`
- Active branch: `openclaw/elevateos-mvp`
- Available surfaces on that host: GitHub, DigitalOcean, and GCP
- Scope: consumer-facing MVP edits for ElevateOS only
- Do not use the OpenClaw ops workspace for repo edits
- If a file is already in active use by Claude Code, report the conflict and stop

## Product boundary

- Keep admissions and internships on `elevateos.org`
- Keep tutoring isolated to `tutoring.elevateos.org`
- Keep Google Cloud and other backend infrastructure language out of frontend copy
- Prefer reversible, user-visible fixes over broad rewrites

## OpenClaw write-agent prompt

```text
Work only in /home/edwardthevaporizer_gmail_com/elevateos on branch openclaw/elevateos-mvp.

Make consumer-facing MVP edits only. Keep admissions and internships on elevateos.org, and keep tutoring isolated to tutoring.elevateos.org.

Do not touch the OpenClaw ops workspace. Do not overwrite files already being changed by Claude Code; report conflicts and stop.

Use GitHub, DigitalOcean, and GCP access only when needed for the app repo.
```

## Claude Code prompt

```text
Work in the real ElevateOS checkout only.

Respect the product boundary: main site = admissions + internships, tutoring subdomain = tutoring workflows.

Avoid conflict with OpenClaw changes. If a file is already dirty or ownership is unclear, stop and report it.

Prefer reversible consumer-visible fixes and verify with a build plus route checks.
```
