[CmdletBinding()]
param(
  [string]$Part = "Funnel A Backend",

  [string]$RepoPath = ".",

  [int]$RestartDelaySeconds = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$resolvedRepo = (Resolve-Path $RepoPath).Path
$loopScript = (Resolve-Path (Join-Path $resolvedRepo "scripts\\funnel-a-autopilot.ps1")).Path

while ($true) {
  Write-Host "Starting funnel-a-autopilot loop at $(Get-Date -Format o)"
  try {
    & $loopScript -Part $Part -RepoPath $resolvedRepo
    $exitCode = $LASTEXITCODE
    Write-Warning "Autopilot loop exited with code $exitCode. Restarting in $RestartDelaySeconds seconds."
  }
  catch {
    Write-Warning "Autopilot loop crashed: $($_.Exception.Message). Restarting in $RestartDelaySeconds seconds."
  }
  Start-Sleep -Seconds $RestartDelaySeconds
}
