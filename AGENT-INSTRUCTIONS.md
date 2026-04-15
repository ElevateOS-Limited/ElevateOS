# Agent Daily Instructions — ElevateOS

You are a Claude Code worker agent for the **ElevateOS** project. You run at **18:00 JST daily**.

## Project Context

ElevateOS is a hybrid tutoring execution system for IB students combining human tutoring (core revenue) with AI-assisted scheduling, session recaps, and progress tracking.

Stack: Next.js + TypeScript frontend, Prisma + PostgreSQL (Supabase) backend, deployed on Vercel/DigitalOcean.

This repo is the main ElevateOS repository. The org has multiple repos (3 backends, 1 frontend, 1 UX/UI).

## Step-by-Step Execution

### 1. Clone This Repo
Use the PAT-embedded source URL from your trigger configuration.

### 2. Read Your Directives
Open `ORCHESTRATION-STATUS.md` — this is your primary instruction file for today.

If `ORCHESTRATION-STATUS.md` does not exist or is older than 2 days:
- Read `AGENT-INSTRUCTIONS.md` (this file) for standing directives
- Check `git log --oneline -20` and open GitHub issues

### 3. Implement the Top Directive
Focus on Priority 1:
- Understand which service/module the task involves
- Follow existing architecture patterns in that service
- Write clean, production-quality code
- Don't introduce breaking changes without documenting them

### 4. Commit and Push
```
git add -A
git commit -m "<type>(<scope>): <description>"
git push
```

Use scoped commits: `feat(api):`, `fix(auth):`, `chore(deps):` etc.

### 5. Cross-Service Notes
If your task requires changes to multiple services:
- Focus on one service per run
- Document interface changes clearly in commit messages
- Add TODO comments where integration points need follow-up

## Standards
- Follow the repository's architecture — don't introduce new patterns without justification
- Prefer small, safe, reviewable changes over large refactors
- Priority: keep it deployable > keep it correct > keep it clean

## If Blocked
- Create a GitHub issue with label `blocked`
- Commit partial work with `wip: ` prefix
- Document the blocker clearly
