param(
  [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
  [string[]]$PartTokens
)

$Part = ($PartTokens -join ' ').Trim()
if ([string]::IsNullOrWhiteSpace($Part)) { $Part = 'Part' }

$ErrorActionPreference = 'Continue'
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

$repo = 'ElevateOS-Limited/elevateos'
$stateFile = '/tmp/funnel-a-daemon-state.json'
$cooldownSec = 600

function Get-ActivePr {
  $json = gh pr list --repo $repo --state open --search 'label:funnel-a-active' --json number,url,reviewDecision,headRefOid,updatedAt,title
  if (-not $json) { return $null }
  $arr = $json | ConvertFrom-Json
  if ($arr.Count -eq 0) { return $null }
  return $arr[0]
}

while ($true) {
  try {
    $pr = Get-ActivePr
    if ($null -eq $pr) {
      Write-Host "[daemon] no active funnel-a-active PR"
      Start-Sleep -Seconds 300
      continue
    }

    $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $lastGate = 0
    if (Test-Path $stateFile) {
      try {
        $state = Get-Content $stateFile -Raw | ConvertFrom-Json
        $lastGate = [int64]$state.lastGate
      } catch {}
    }

    if ($pr.reviewDecision -eq 'CHANGES_REQUESTED') {
      gh pr comment $pr.number --repo $repo --body '@codex address that feedback' | Out-Null
    }

    if (($now - $lastGate) -ge $cooldownSec) {
      gh pr comment $pr.number --repo $repo --body '/funnel-a gate' | Out-Null
      @{ lastGate = $now; pr = $pr.number; part = $Part } | ConvertTo-Json | Set-Content $stateFile
    }

    Write-Host "[daemon] pr #$($pr.number) decision=$($pr.reviewDecision) head=$($pr.headRefOid.Substring(0,8))"
  } catch {
    Write-Host "[daemon] error: $($_.Exception.Message)"
  }

  Start-Sleep -Seconds 300
}
