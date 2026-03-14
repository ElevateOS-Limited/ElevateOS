# Domain Scope Guardrails (Containment)

Purpose: prevent cross-project/domain confusion on shared VPS hosts.

## Hard Rules

1. Never run infra-changing commands without explicit target confirmation:
   - domain
   - account/user
   - vhost file
   - document root
2. Default mode is read-only diagnostics first.
3. Never mix actions across `crystalcentury.com` and `thinkcollegelevel.com` in one change set.
4. Before any write, run preflight and save evidence under:
   - `artifacts/legal_protection_pack/vps_inventory/<timestamp>-containment/`
5. Require explicit human approval before:
   - web server config edits
   - DNS/Cloudflare changes
   - panel/account credential changes

## Current Mapping (verified)

- `crystalcentury.com` => `/home/crystalcentury/public_html`
- `thinkcollegelevel.com` => `/home/crystalcentury/thinkcollegelevel.com`
- Both currently operate under account namespace `crystalcentury`.

## Operational Pattern

- Step 1: preflight (`scripts/preflight_domain_guard.sh <target-domain>`)
- Step 2: human confirms target tuple
- Step 3: snapshot evidence
- Step 4: execute minimal scoped change
- Step 5: verify + record artifacts
