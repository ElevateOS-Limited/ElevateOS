[CmdletBinding()]
param(
  [string]$WorkspacePath = "/root/.openclaw/workspace/edutech-demo",

  [string]$BackupRoot = "/root/.openclaw/backups",

  [string]$GatewayServiceName = "openclaw-gateway.service",

  [string[]]$Pm2Apps = @("edutech-demo", "edutech-mini"),

  [switch]$SkipBuild,

  [string]$LogDir = "/root/.openclaw/logs"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Log([string]$Message, [string]$Level = "INFO") {
  $line = "[$(Get-Date -Format o)] [$Level] $Message"
  Write-Host $line
  if ($script:LogFile) {
    Add-Content -Path $script:LogFile -Value $line
  }
}

function Assert-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

function Run-OrThrow([string]$Command, [string]$Description) {
  Write-Log "$Description -> $Command"
  & bash -lc $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Description failed (exit code $LASTEXITCODE)"
  }
}

if (-not $IsLinux) {
  throw "This script targets Linux OpenClaw hosts. Current OS is not Linux."
}

Assert-Command "bash"
Assert-Command "git"
Assert-Command "npm"

if (-not (Test-Path $WorkspacePath)) {
  throw "Workspace path not found: $WorkspacePath"
}

New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

$stamp = Get-Date -Format "yyyyMMddTHHmmssZ"
$script:LogFile = Join-Path $LogDir ("openclaw-daily-autopatch-{0}.log" -f $stamp)
Write-Log "Starting daily OpenClaw autopatch"

$backupPath = Join-Path $BackupRoot ("state-{0}.tar.gz" -f $stamp)
Run-OrThrow -Description "Create workspace backup" -Command "tar -czf '$backupPath' -C '$WorkspacePath' ."

Run-OrThrow -Description "Fetch repository updates" -Command "git -C '$WorkspacePath' fetch --all --prune"
Run-OrThrow -Description "Checkout main branch" -Command "git -C '$WorkspacePath' checkout main"
Run-OrThrow -Description "Pull latest main" -Command "git -C '$WorkspacePath' pull --ff-only origin main"

if (-not $SkipBuild) {
  if (Test-Path (Join-Path $WorkspacePath "package-lock.json")) {
    Run-OrThrow -Description "Install dependencies (npm ci)" -Command "cd '$WorkspacePath' && npm ci"
  } else {
    Run-OrThrow -Description "Install dependencies (npm install)" -Command "cd '$WorkspacePath' && npm install"
  }

  if (Test-Path (Join-Path $WorkspacePath "prisma/schema.prisma")) {
    Run-OrThrow -Description "Generate Prisma client" -Command "cd '$WorkspacePath' && npm run db:generate"
  }

  Run-OrThrow -Description "Build project" -Command "cd '$WorkspacePath' && npm run build"
}

if (Get-Command systemctl -ErrorAction SilentlyContinue) {
  Write-Log "Restarting user gateway service: $GatewayServiceName"
  & bash -lc "systemctl --user restart '$GatewayServiceName'"
  if ($LASTEXITCODE -ne 0) {
    Write-Log "systemctl --user restart failed for $GatewayServiceName" "WARN"
  } else {
    Write-Log "Gateway service restarted: $GatewayServiceName"
  }
} else {
  Write-Log "systemctl not found; skipping gateway restart." "WARN"
}

if (Get-Command pm2 -ErrorAction SilentlyContinue) {
  foreach ($app in $Pm2Apps) {
    Write-Log "Restarting PM2 app: $app"
    & bash -lc "pm2 restart '$app'"
    if ($LASTEXITCODE -ne 0) {
      Write-Log "PM2 restart failed for app '$app'" "WARN"
    }
  }
  & bash -lc "pm2 save"
  if ($LASTEXITCODE -ne 0) {
    Write-Log "PM2 save failed" "WARN"
  }
} else {
  Write-Log "pm2 not found; skipping PM2 restarts." "WARN"
}

Write-Log "Daily OpenClaw autopatch completed successfully"
Write-Host ""
Write-Host "Log file: $script:LogFile"
Write-Host "Backup file: $backupPath"
