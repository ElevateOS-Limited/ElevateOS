[CmdletBinding()]
param(
  [string]$Part = "Funnel A Backend",

  [string]$RepoPath = ".",

  [int]$CycleMinutes = 15,

  [int]$MaxCycles = 0,

  [int]$StatusEveryMinutes = 60,

  [int]$GateCooldownMinutes = 20,

  [int]$ReviewCooldownMinutes = 20,

  [int]$CodexCooldownMinutes = 20,

  [int]$NoActiveCooldownMinutes = 30,

  [string]$ActiveLabel = "funnel-a-active",

  [bool]$AssignLabelIfMissing = $true,

  [bool]$NudgeWhenNoActive = $true,

  [bool]$RunReviewBeforeGate = $true,

  [bool]$RunBuildBeforeGate = $false,

  [string]$OutputDir = "$HOME\\codex-reviews"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GhCommand {
  $cmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($cmd) { return "gh" }

  $fallback = "C:\\Program Files\\GitHub CLI\\gh.exe"
  if (Test-Path $fallback) { return $fallback }

  throw "GitHub CLI not found. Install GitHub CLI first."
}

function Get-GitCommand {
  $cmd = Get-Command git -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $fallbacks = @(
    "C:\\Program Files\\Git\\cmd\\git.exe",
    "C:\\Program Files\\Git\\bin\\git.exe"
  )
  foreach ($fallback in $fallbacks) {
    if (Test-Path $fallback) { return $fallback }
  }

  $desktopRoot = Join-Path $env:LOCALAPPDATA "GitHubDesktop"
  if (Test-Path $desktopRoot) {
    $candidate = Get-ChildItem -Path $desktopRoot -Filter "git.exe" -Recurse -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -like "*\\resources\\app\\git\\cmd\\git.exe" } |
      Sort-Object FullName -Descending |
      Select-Object -First 1
    if ($candidate) { return $candidate.FullName }
  }

  throw "git executable not found."
}

function Ensure-GitOnPath([string]$GitPath) {
  $gitDir = Split-Path -Parent $GitPath
  $pathParts = @($env:Path -split ';')
  if ($pathParts -notcontains $gitDir) {
    $env:Path = "$gitDir;$env:Path"
  }
}

function Get-RepoFullName([string]$Gh) {
  $repoName = (& $Gh repo view --json nameWithOwner --jq ".nameWithOwner" 2>$null)
  if ($LASTEXITCODE -ne 0 -or -not $repoName) {
    throw "Unable to resolve repo nameWithOwner via gh."
  }
  return $repoName.Trim()
}

function To-Millis([string]$Stamp) {
  if (-not $Stamp) { return 0 }
  try {
    return [DateTimeOffset]::Parse($Stamp).ToUnixTimeMilliseconds()
  } catch {
    return 0
  }
}

function Minutes-Since([long]$TimestampMs) {
  if ($TimestampMs -le 0) { return [int]::MaxValue }
  $delta = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $TimestampMs
  return [int][Math]::Floor($delta / 60000.0)
}

function Get-OpenPrs([string]$Gh) {
  $json = & $Gh pr list --state open --limit 100 --json number,title,url,updatedAt,baseRefName,isDraft,labels
  if ($LASTEXITCODE -ne 0 -or -not $json) { return @() }
  return @($json | ConvertFrom-Json)
}

function Get-PaginatedItems([string]$Gh, [string]$Endpoint) {
  $json = & $Gh api --paginate --slurp $Endpoint 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $json) { return @() }

  try {
    $pages = @($json | ConvertFrom-Json)
  } catch {
    return @()
  }

  $items = New-Object System.Collections.Generic.List[object]
  foreach ($page in $pages) {
    foreach ($item in @($page)) {
      if ($null -ne $item) { $items.Add($item) }
    }
  }
  return @($items)
}

function Get-IssueComments([string]$Gh, [string]$RepoFullName, [int]$PrNumber) {
  return Get-PaginatedItems -Gh $Gh -Endpoint "repos/$RepoFullName/issues/$PrNumber/comments?per_page=100&sort=created&direction=desc"
}

function Get-Reviews([string]$Gh, [string]$RepoFullName, [int]$PrNumber) {
  return Get-PaginatedItems -Gh $Gh -Endpoint "repos/$RepoFullName/pulls/$PrNumber/reviews?per_page=100"
}

function Has-Label([object]$Pr, [string]$Label) {
  $labels = @($Pr.labels | ForEach-Object { [string]$_.name })
  return $labels -contains $Label
}

function Get-PullFiles([string]$Gh, [string]$RepoFullName, [int]$PrNumber) {
  $files = Get-PaginatedItems -Gh $Gh -Endpoint "repos/$RepoFullName/pulls/$PrNumber/files?per_page=100"
  if ($files.Count -eq 0) { return @() }
  return @($files | ForEach-Object { [string]$_.filename } | Where-Object { $_ } | Sort-Object -Unique)
}

function Is-BackendCandidate([string[]]$Files) {
  foreach ($file in $Files) {
    if (
      $file -like "src/app/api/*" -or
      $file -like "src/lib/auth/*" -or
      $file -like "src/lib/db/*" -or
      $file -like "prisma/*"
    ) {
      return $true
    }
  }
  return $false
}

function Ensure-LabelExists([string]$Gh, [string]$Label) {
  $labelsJson = & $Gh label list --limit 200 --json name
  if ($LASTEXITCODE -ne 0 -or -not $labelsJson) { throw "Unable to list labels." }
  $labels = @($labelsJson | ConvertFrom-Json | ForEach-Object { [string]$_.name })
  if ($labels -contains $Label) { return }
  & $Gh label create $Label --color "0e8a16" --description "Single active Funnel A PR"
  if ($LASTEXITCODE -ne 0) { throw "Failed to create label '$Label'." }
}

function Resolve-ActivePr([string]$Gh, [string]$RepoFullName, [string]$Label, [bool]$AllowAssign) {
  $open = Get-OpenPrs -Gh $Gh
  $active = @($open | Where-Object { Has-Label $_ $Label } | Sort-Object updatedAt -Descending)
  if ($active.Count -gt 0) { return $active[0] }
  if (-not $AllowAssign) { return $null }

  $candidates = @($open | Where-Object { -not $_.isDraft -and $_.baseRefName -eq "main" } | Sort-Object updatedAt -Descending)
  foreach ($candidate in $candidates) {
    $files = Get-PullFiles -Gh $Gh -RepoFullName $RepoFullName -PrNumber ([int]$candidate.number)
    if (-not (Is-BackendCandidate -Files $files)) { continue }

    Ensure-LabelExists -Gh $Gh -Label $Label
    & $Gh pr edit ([int]$candidate.number) --add-label $Label | Out-Null
    if ($LASTEXITCODE -ne 0) { continue }

    $commentBody = @(
      "[LOCAL:AUTO_ACTIVE_ASSIGN]",
      "",
      "Assigned this PR as active backend Funnel A work (label: $Label).",
      "Autopilot loop is now running continuous gate/patch/status cycles."
    ) -join "`n"
    & $Gh pr comment ([int]$candidate.number) --body $commentBody | Out-Null
    return $candidate
  }

  return $null
}

function Get-LatestVerdict([object[]]$Comments, [object[]]$Reviews) {
  $events = New-Object System.Collections.Generic.List[object]
  foreach ($comment in $Comments) {
    $body = [string]$comment.body
    if (-not $body.Contains("merge verdict:")) { continue }
    $events.Add([PSCustomObject]@{
        body = $body
        ts   = To-Millis ([string]$comment.created_at)
      })
  }
  foreach ($review in $Reviews) {
    $body = [string]$review.body
    if (-not $body.Contains("merge verdict:")) { continue }
    $stamp = [string]$review.submitted_at
    if (-not $stamp) { $stamp = [string]$review.created_at }
    $events.Add([PSCustomObject]@{
        body = $body
        ts   = To-Millis $stamp
      })
  }

  if ($events.Count -eq 0) {
    return [PSCustomObject]@{
      verdict = "NOT_FOUND"
      ts      = 0
      line    = "merge verdict: NOT_FOUND"
    }
  }

  $latest = @($events | Sort-Object ts -Descending)[0]
  $line = @([string]$latest.body -split "`n" | Where-Object { $_ -match "merge verdict:" } | Select-Object -First 1)
  $verdictLine = if ($line) { $line[0].Trim() } else { "merge verdict: UNKNOWN" }
  $verdict = "UNKNOWN"
  if ($verdictLine -match 'merge verdict:\s*([A-Z_]+)') {
    $verdict = $Matches[1]
  }
  return [PSCustomObject]@{
    verdict = $verdict
    ts      = [long]$latest.ts
    line    = $verdictLine
  }
}

function Try-GetLatestGateRun([string]$Gh, [string]$RepoFullName, [int]$PrNumber) {
  try {
    $matching = New-Object System.Collections.Generic.List[object]
    $page = 1
    while ($page -le 3) {
      $runsJson = & $Gh api "repos/$RepoFullName/actions/workflows/pr-governance-gate.yml/runs?per_page=100&page=$page" 2>$null
      if ($LASTEXITCODE -ne 0 -or -not $runsJson) { break }

      $response = $runsJson | ConvertFrom-Json
      $runs = @($response.workflow_runs)
      if ($runs.Count -eq 0) { break }

      foreach ($run in $runs) {
        $linked = @($run.pull_requests | ForEach-Object { [int]$_.number })
        if ($linked -contains $PrNumber) { $matching.Add($run) }
      }

      if ($runs.Count -lt 100) { break }
      $page += 1
    }
    if ($matching.Count -eq 0) { return $null }
    return @($matching | Sort-Object created_at -Descending)[0]
  } catch {
    return $null
  }
}

function Has-RecentMarker([object[]]$Comments, [string]$Marker, [int]$WithinMinutes) {
  foreach ($comment in $Comments) {
    $body = [string]$comment.body
    if (-not $body.Contains($Marker)) { continue }
    $age = Minutes-Since (To-Millis ([string]$comment.created_at))
    if ($age -lt $WithinMinutes) { return $true }
  }
  return $false
}

function Get-LatestMergedPr([string]$Gh, [string]$Label) {
  $json = & $Gh pr list --search "is:pr is:merged label:$Label base:main" --state closed --limit 1 --json number,url,title
  if ($LASTEXITCODE -ne 0 -or -not $json) { return $null }
  $items = @($json | ConvertFrom-Json)
  if ($items.Count -eq 0) {
    $fallbackJson = & $Gh pr list --search "is:pr is:merged base:main" --state closed --limit 1 --json number,url,title
    if ($LASTEXITCODE -ne 0 -or -not $fallbackJson) { return $null }
    $fallbackItems = @($fallbackJson | ConvertFrom-Json)
    if ($fallbackItems.Count -eq 0) { return $null }
    return $fallbackItems[0]
  }
  return $items[0]
}

function Get-BlockersFromVerdict([string]$Verdict) {
  if ($Verdict -eq "REQUEST_CHANGES") { return "merge verdict is REQUEST_CHANGES" }
  if ($Verdict -eq "NOT_FOUND") { return "merge verdict not found yet" }
  return "merge verdict: $Verdict"
}

$gh = Get-GhCommand
$git = Get-GitCommand
Ensure-GitOnPath -GitPath $git

$resolvedRepo = (Resolve-Path $RepoPath).Path
Set-Location $resolvedRepo

if (-not $env:GH_TOKEN -and -not $env:GITHUB_TOKEN) {
  $null = & $gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) { throw "gh auth is not ready. Run: gh auth login" }
}

$repoFullName = Get-RepoFullName -Gh $gh
$reviewScript = (Resolve-Path ".\\scripts\\review-pr.ps1").Path
$gateScript = (Resolve-Path ".\\scripts\\funnel-a-gate.ps1").Path
$statusScript = (Resolve-Path ".\\scripts\\funnel-a-status.ps1").Path

$cycle = 0
while ($true) {
  $cycle += 1
  Write-Host "Autopilot cycle $cycle started at $(Get-Date -Format o)"
  try {
    $activePr = Resolve-ActivePr -Gh $gh -RepoFullName $repoFullName -Label $ActiveLabel -AllowAssign $AssignLabelIfMissing
    if (-not $activePr) {
      Write-Host "No active backend PR found."
      if ($NudgeWhenNoActive) {
        $latestMerged = Get-LatestMergedPr -Gh $gh -Label $ActiveLabel
        if ($latestMerged) {
          $mergedPrNumber = [int]$latestMerged.number
          $mergedComments = Get-IssueComments -Gh $gh -RepoFullName $repoFullName -PrNumber $mergedPrNumber
          if (-not (Has-RecentMarker -Comments $mergedComments -Marker "[LOCAL:NO_ACTIVE_PR]" -WithinMinutes $NoActiveCooldownMinutes)) {
            $noActiveBody = @(
              "[LOCAL:NO_ACTIVE_PR]",
              "",
              "No open PR labeled $ActiveLabel is currently available for backend autopilot.",
              "",
              "Required now:",
              "1. Open the next backend Funnel A PR from main and apply label $ActiveLabel.",
              "2. Post part plan and push first backend commit.",
              "3. If no current backend task is queued, proactively ask the user for the next task and suggest one from MASTER_TASK_BOARD.md.",
              "",
              "@codex address that feedback"
            ) -join "`n"
            & $gh pr comment $mergedPrNumber --body $noActiveBody | Out-Null
          }
        }
      }
    } else {
      $prNumber = [int]$activePr.number
      $prUrl = [string]$activePr.url
      Write-Host "Active PR: #$prNumber ($prUrl)"

      $comments = Get-IssueComments -Gh $gh -RepoFullName $repoFullName -PrNumber $prNumber
      $reviews = Get-Reviews -Gh $gh -RepoFullName $repoFullName -PrNumber $prNumber
      $verdictInfo = Get-LatestVerdict -Comments $comments -Reviews $reviews
      $latestRun = Try-GetLatestGateRun -Gh $gh -RepoFullName $repoFullName -PrNumber $prNumber

      $blockers = "none"
      $nextAction = "Monitor gate and continue backend patch loop."

      if ($verdictInfo.verdict -eq "APPROVE") {
        $nextAction = "Await merge handoff and continue with next backend PR immediately."
      } else {
        $blockers = Get-BlockersFromVerdict -Verdict $verdictInfo.verdict

        if ($RunBuildBeforeGate) {
          & npm run build
          if ($LASTEXITCODE -ne 0) {
            $blockers = "$blockers; local build failed"
          }
        }

        if (-not (Has-RecentMarker -Comments $comments -Marker "[LOCAL:CODING_NUDGE]" -WithinMinutes $CodexCooldownMinutes)) {
          $nudgeBody = @(
            "[LOCAL:CODING_NUDGE]",
            "",
            "part: $Part",
            "verdict: $($verdictInfo.verdict)",
            "",
            "Apply backend patch loop and rerun gate now.",
            "If this task is complete, immediately continue with the next queued backend task without idle time.",
            "",
            "@codex address that feedback"
          ) -join "`n"
          & $gh pr comment $prNumber --body $nudgeBody | Out-Null
        }

        $shouldRunReview = $false
        if ($RunReviewBeforeGate -and $verdictInfo.verdict -ne "APPROVE") {
          $verdictAge = Minutes-Since $verdictInfo.ts
          if ($verdictAge -ge $ReviewCooldownMinutes) {
            $shouldRunReview = $true
          }
        }

        if ($shouldRunReview) {
          & $reviewScript -PrNumber $prNumber -RepoPath $resolvedRepo -RunBuild -PostReviewDecision -OutputDir $OutputDir
          if ($LASTEXITCODE -ne 0) {
            $blockers = "$blockers; local review gate failed"
          } else {
            $comments = Get-IssueComments -Gh $gh -RepoFullName $repoFullName -PrNumber $prNumber
            $reviews = Get-Reviews -Gh $gh -RepoFullName $repoFullName -PrNumber $prNumber
            $verdictInfo = Get-LatestVerdict -Comments $comments -Reviews $reviews
            $blockers = Get-BlockersFromVerdict -Verdict $verdictInfo.verdict
          }
        }

        $shouldTriggerGate = $true
        if ($latestRun) {
          $runStatus = [string]$latestRun.status
          $runAge = Minutes-Since (To-Millis ([string]$latestRun.created_at))
          if (($runStatus -in @("queued", "in_progress")) -and ($runAge -lt $GateCooldownMinutes)) {
            $shouldTriggerGate = $false
          } elseif (($runAge -lt $GateCooldownMinutes) -and ($verdictInfo.verdict -ne "REQUEST_CHANGES")) {
            $shouldTriggerGate = $false
          }
        }

        if ($shouldTriggerGate) {
          & $gateScript -PrNumber $prNumber -RepoPath $resolvedRepo -WaitForResult -PollSeconds 45 -OutputDir $OutputDir
          if ($LASTEXITCODE -ne 0) {
            $blockers = "$blockers; gate trigger failed"
          }
        }

        $nextAction = "Continue backend implementation and rerun /funnel-a gate until APPROVE."
      }

      if (-not (Has-RecentMarker -Comments $comments -Marker "[LOCAL:STATUS_AUTO]" -WithinMinutes $StatusEveryMinutes)) {
        & $statusScript -PrNumber $prNumber -Part $Part -NextAction $nextAction -Blockers $blockers -RepoPath $resolvedRepo -PostToPr -Marker "[LOCAL:STATUS_AUTO]" -OutputDir $OutputDir
      }
    }
  }
  catch {
    Write-Warning "Autopilot cycle $cycle failed: $($_.Exception.Message)"
  }

  if ($MaxCycles -gt 0 -and $cycle -ge $MaxCycles) {
    Write-Host "Reached MaxCycles=$MaxCycles. Stopping autopilot loop."
    break
  }

  if ($CycleMinutes -lt 1) { $CycleMinutes = 1 }
  Start-Sleep -Seconds ($CycleMinutes * 60)
}
