import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

function hydrateGoogleApplicationCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return
  }

  const encodedJson = (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_B64 || '').trim()
  const rawJson = (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '').trim()
  const payload = encodedJson
    ? Buffer.from(encodedJson, 'base64').toString('utf8')
    : rawJson

  if (!payload) return

  let parsed
  try {
    parsed = JSON.parse(payload)
  } catch {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS_JSON_B64 or GOOGLE_APPLICATION_CREDENTIALS_JSON must contain valid service account JSON'
    )
  }

  const credentialsDir = mkdtempSync(join(tmpdir(), 'elevateos-gcp-'))
  const credentialsPath = join(credentialsDir, 'service-account.json')
  writeFileSync(credentialsPath, JSON.stringify(parsed, null, 2), { mode: 0o600 })

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath

  if (!process.env.GOOGLE_CLOUD_PROJECT && typeof parsed.project_id === 'string' && parsed.project_id.trim()) {
    process.env.GOOGLE_CLOUD_PROJECT = parsed.project_id.trim()
  }
}

hydrateGoogleApplicationCredentials()

const port = process.env.PORT || '8080'
const nextBin = resolve('node_modules/next/dist/bin/next')

const child = spawn(process.execPath, [nextBin, 'start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
