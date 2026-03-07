[CmdletBinding()]
param(
  [string]$WorkspacePath = "/root/.openclaw/workspace/edutech-demo",

  [string]$BackupRoot = "/root/.openclaw/backups",

  [string]$GatewayServiceName = "openclaw-gateway.service",

  [string[]]$Pm2Apps = @("edutech-demo", "edutech-mini"),

  [switch]$SkipBuild,

  [switch]$SkipRuntimeVerification,

  [string[]]$HealthUrls = @(
    "http://127.0.0.1:3000/",
    "http://127.0.0.1:3000/demo",
    "http://127.0.0.1:3000/dashboard/quickstart"
  ),

  [int]$HealthRetries = 8,

  [int]$HealthDelaySeconds = 5,

  [int]$BackupRetentionDays = 14,

  [string]$LockFile = "/tmp/openclaw-daily-autopatch.lock",

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

function Acquire-RunLock([string]$Path) {
  if (Test-Path $Path) {
    $stale = $false
    $existingPidRaw = Get-Content -Path $Path -Raw -ErrorAction SilentlyContinue
    $existingPid = 0
    if ([int]::TryParse(($existingPidRaw.Trim()), [ref]$existingPid)) {
      $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
      if ($proc) {
        throw "Another autopatch run is already active (pid=$existingPid, lock=$Path)."
      } else {
        $stale = $true
      }
    } else {
      $stale = $true
    }

    if ($stale) {
      Remove-Item -Path $Path -Force -ErrorAction SilentlyContinue
    }
  }

  $PID | Set-Content -Path $Path -Encoding UTF8 -NoNewline
}

function Release-RunLock([string]$Path) {
  if (Test-Path $Path) {
    Remove-Item -Path $Path -Force -ErrorAction SilentlyContinue
  }
}

function Prune-OldBackups([string]$Root, [int]$RetentionDays) {
  if ($RetentionDays -lt 1) { return }
  $cutoff = (Get-Date).ToUniversalTime().AddDays(-$RetentionDays)
  $toDelete = @(
    Get-ChildItem -Path $Root -Filter "state-*.tar.gz" -File -ErrorAction SilentlyContinue |
      Where-Object { $_.LastWriteTimeUtc -lt $cutoff }
  )
  foreach ($item in $toDelete) {
    Remove-Item -Path $item.FullName -Force -ErrorAction SilentlyContinue
  }
  Write-Log "Backup retention prune complete: removed $($toDelete.Count) file(s) older than $RetentionDays day(s)."
}

function Assert-GatewayActive([string]$ServiceName) {
  $state = (& bash -lc "systemctl --user is-active '$ServiceName'" 2>$null)
  if ($LASTEXITCODE -ne 0) {
    throw "Gateway service state check failed for '$ServiceName'."
  }
  $stateText = [string]($state | Select-Object -First 1)
  if ($stateText.Trim() -ne "active") {
    throw "Gateway service '$ServiceName' is not active (state='$stateText')."
  }
  Write-Log "Gateway service verified active: $ServiceName"
}

function Assert-Pm2AppsOnline([string[]]$Apps) {
  $pm2Json = (& bash -lc "pm2 jlist" 2>$null)
  if ($LASTEXITCODE -ne 0 -or -not $pm2Json) {
    throw "Unable to read PM2 process list."
  }

  $entries = @($pm2Json | ConvertFrom-Json)
  foreach ($app in $Apps) {
    $entry = @($entries | Where-Object { ([string]$_.name) -eq $app } | Select-Object -First 1)
    if (-not $entry) {
      throw "PM2 app not found: $app"
    }
    $status = [string]$entry[0].pm2_env.status
    if ($status -ne "online") {
      throw "PM2 app '$app' is not online (status='$status')."
    }
  }
  Write-Log "PM2 apps verified online: $($Apps -join ', ')"
}

function Assert-HealthUrls([string[]]$Urls, [int]$Retries, [int]$DelaySeconds) {
  foreach ($url in $Urls) {
    $ok = $false
    for ($attempt = 1; $attempt -le $Retries; $attempt += 1) {
      try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
          $ok = $true
          break
        }
      } catch {
        # retry
      }
      Start-Sleep -Seconds $DelaySeconds
    }
    if (-not $ok) {
      throw "Health check failed after $Retries retries: $url"
    }
    Write-Log "Health check passed: $url"
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

Acquire-RunLock -Path $LockFile
try {
  Prune-OldBackups -Root $BackupRoot -RetentionDays $BackupRetentionDays

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

  if (-not $SkipRuntimeVerification) {
    if (Get-Command systemctl -ErrorAction SilentlyContinue) {
      Assert-GatewayActive -ServiceName $GatewayServiceName
    }
    if (Get-Command pm2 -ErrorAction SilentlyContinue) {
      Assert-Pm2AppsOnline -Apps $Pm2Apps
    }
    Assert-HealthUrls -Urls $HealthUrls -Retries $HealthRetries -DelaySeconds $HealthDelaySeconds
    Write-Log "Runtime verification completed."
  } else {
    Write-Log "Runtime verification skipped by flag."
  }

  Write-Log "Daily OpenClaw autopatch completed successfully"
  Write-Host ""
  Write-Host "Log file: $script:LogFile"
  Write-Host "Backup file: $backupPath"
}
finally {
  Release-RunLock -Path $LockFile
}
