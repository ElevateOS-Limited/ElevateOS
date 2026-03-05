# Codex Review Instructions (AGENTS.md)

## Blockers (must fail review)
- Any API route missing RBAC guard
- Any Prisma query on tenant data missing orgId filter
- Any placeholder/TODO UI in Funnel A or Integrity module
- Any Integrity job that is not idempotent

## Must-check flows
- Funnel A end-to-end click path works
- Integrity: upload → extract → segment → score → highlight → export → persist → student linkage

## Exports
- PDF/DOCX/PPTX exports are non-empty and include required headings/metadata
