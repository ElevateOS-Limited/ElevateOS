# DigitalOcean App Platform Settings

This repo is now wired for App Platform, but the app's control-plane settings still need to match.

Use these values on the existing web service component:

```yaml
run_command: npm run start
http_port: 8080
health_check:
  http_path: /healthz
  port: 8080
  initial_delay_seconds: 10
  period_seconds: 10
  timeout_seconds: 5
  failure_threshold: 3
  success_threshold: 1
liveness_health_check:
  http_path: /healthz
  port: 8080
  initial_delay_seconds: 30
  period_seconds: 30
  timeout_seconds: 5
  failure_threshold: 3
  success_threshold: 1
```

Notes:

- Keep existing secrets, domains, and database bindings from the current app spec. Do not replace the full spec with only the snippet above.
- `npm run start` uses `scripts/start-prod.mjs`, which binds Next.js to `0.0.0.0` and respects `PORT`.
- `/healthz` is the liveness endpoint for App Platform. `/api/health` remains available for diagnostics and supports `?check=db` when you want a database probe.
- If the app has no `DATABASE_URL`, keep `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` so the site still boots.
- For Vertex AI on App Platform, add:
  - `GOOGLE_GENAI_USE_VERTEXAI=true`
  - `GOOGLE_CLOUD_PROJECT=arched-science-483612-j6`
  - `GOOGLE_CLOUD_LOCATION=us-central1`
  - `GOOGLE_APPLICATION_CREDENTIALS_JSON_B64=<base64 service account JSON>`
