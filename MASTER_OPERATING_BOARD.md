# MASTER OPERATING BOARD (MULTI-TRACK)

## Track A — Product Delivery (Funnel A)
Owner: Arby (builder) + Codex (review gate)
Goal: Reliable tutor workflow from quickstart to reports
Current: Parts 1–6 merged; continue part-by-part PR loop
KPIs:
- Quickstart completion rate
- Report save success rate
- Worksheet generation success rate
- Regression count per release

## Track B — Product Expansion (Funnel B: Activities)
Owner: Aviral (framework), Arby (implementation)
Goal: Activity recommender + curation workflow
Current:
- activities.thinkcollegelevel.com routing prepared
- Activity database schema + APIs added in code
- DB push executed successfully on VPS
Next:
- admin curation UI
- recommendation scoring integration
- review queue + status transitions
KPIs:
- Approved opportunities count
- Recommendation relevance rating
- Plan acceptance rate by tutors

## Track C — Infrastructure & Reliability
Owner: Arby
Goal: Zero-disruption operations
Current:
- Gateway normalized to single canonical systemd user service
- stale duplicate service disabled
- PM2 persistence verified
- app backup snapshot created
- Cloudflare wildcard + activities DNS active
KPIs:
- Uptime
- Mean recovery time
- Failed deploy count

## Track D — Governance & PR Operations
Owner: Codex gate + Arby execution
Goal: Autonomous PR loop without manual babysitting
Current:
- Funnel gate workflows active
- hourly evidence status protocol active
- one active funnel-a PR rule active
KPIs:
- Gate pass turnaround
- Blocked cycle duration
- Protocol breaches/week

## Track E — Business & Ops Strategy
Owner: Howard + team
Goal: Beyond Funnel A, align product to business outcomes
Scope:
- ICP definition
- KPI stack
- Pricing model
- legal/incorp + vendor decisions
- go-to-market execution
Deliverable:
- weekly strategy memo + monthly operating review

## Recovery Entry Point
- Backup set: `/root/.openclaw/backups/state-20260307T073630Z`
- Canonical gateway: `~/.config/systemd/user/openclaw-gateway.service`
- App runtime: PM2 (`edutech-demo`, `edutech-mini`)
