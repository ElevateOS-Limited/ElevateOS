# Security Policy

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Use GitHub's [private vulnerability reporting](../../security/advisories/new) to report security issues confidentially. We will acknowledge within 72 hours and provide a remediation timeline.

## Supported Versions

ElevateOS follows continuous deployment. Only the current production release at elevateos.org is supported.

| Track   | Supported |
|---------|-----------|
| main    | ✅        |
| Older   | ❌        |

## Scope

In scope: authentication flows, payment processing, user data handling, API endpoints, session management.

Out of scope: third-party services (Stripe, NextAuth providers), rate limiting on development environments.

## Disclosure Policy

1. Vulnerability reported privately
2. Confirmed and triaged within 72 hours
3. Fix developed and reviewed in a private branch
4. Patch deployed to production
5. Security advisory published
6. Reporter credited (unless anonymity preferred)