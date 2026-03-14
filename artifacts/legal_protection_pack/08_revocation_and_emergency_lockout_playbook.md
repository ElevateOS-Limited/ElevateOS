# Revocation and Emergency Lockout Playbook

1. Revoke high-risk tokens first (CI/CD, cloud API, PATs).
2. Rotate DB credentials and invalidate active sessions.
3. Remove unnecessary collaborators/admins.
4. Rotate domain/DNS credentials.
5. Snapshot evidence before/after material changes.
6. Use single controlled channel for sensitive communication.
