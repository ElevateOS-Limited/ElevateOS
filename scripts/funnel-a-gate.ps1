[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [int]$PrNumber,

  [string]$RepoPath = ".",

  [switch]$WaitForResult,

  [int]$PollSeconds = 30,

  [string]$OutputDir = "$HOME\\codex-reviews"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GhCommand {
  $cmd = Get-Command gh -ErrorAction SilentlyContinue
  if ($cmd) { return "gh" }

  $fallback = "C:\\Program Files\\GitHub CLI\\gh.exe"
  if (Test-Path $fallback) { return $fallback }

  throw "GitHub CLI not found. Install via: winget install --id GitHub.cli --exact --source winget"
}

function Get-RepoFullName([string]$Gh) {
  $repoName = (& $Gh repo view --json nameWithOwner --jq ".nameWithOwner" 2>$null)
  if ($LASTEXITCODE -ne 0 -or -not $repoName) {
    throw "Unable to resolve repo nameWithOwner via gh."
  }
  return $repoName.Trim()
}

function Get-PaginatedItems([string]$Gh, [string]$Endpoint) {
  $json = & $Gh api --paginate --slurp $Endpoint 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $json) { return @() }

  try {
    $pages = @($json | ConvertFrom-Json)
  }
  catch {
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

function TryGet-LatestGateRun([string]$Gh, [string]$RepoFullName, [int]$PullRequestNumber) {
  try {
    $matching = New-Object System.Collections.Generic.List[object]
    $page = 1
    while ($page -le 3) {
      $runsJson = & $Gh api "repos/$RepoFullName/actions/workflows/pr-governance-gate.yml/runs?per_page=100&page=$page" 2>$null
      if ($LASTEXITCODE -ne 0 -or -not $runsJson) { break }

      $runsResponse = $runsJson | ConvertFrom-Json
      $runs = @($runsResponse.workflow_runs)
      if ($runs.Count -eq 0) { break }

      foreach ($run in $runs) {
        $linked = @($run.pull_requests | ForEach-Object { [int]$_.number })
        if ($linked -contains $PullRequestNumber) { $matching.Add($run) }
      }

      if ($runs.Count -lt 100) { break }
      $page += 1
    }

    if ($matching.Count -eq 0) { return $null }
    return @($matching | Sort-Object created_at -Descending)[0]
  }
  catch {
    return $null
  }
}

function Get-LatestVerdict([string]$Gh, [string]$RepoFullName, [int]$PullRequestNumber) {
  $events = New-Object System.Collections.Generic.List[object]

  $comments = Get-PaginatedItems -Gh $Gh -Endpoint "repos/$RepoFullName/issues/$PullRequestNumber/comments?per_page=100&sort=created&direction=desc"
  foreach ($comment in $comments) {
    if (($comment.body -as [string]) -and $comment.body.Contains("merge verdict:")) {
      try {
        $ts = [DateTimeOffset]::Parse([string]$comment.created_at).ToUnixTimeMilliseconds()
      }
      catch {
        $ts = 0
      }
      $events.Add([PSCustomObject]@{
          body = [string]$comment.body
          ts   = $ts
        })
    }
  }

  $reviews = Get-PaginatedItems -Gh $Gh -Endpoint "repos/$RepoFullName/pulls/$PullRequestNumber/reviews?per_page=100"
  foreach ($review in $reviews) {
    if (($review.body -as [string]) -and $review.body.Contains("merge verdict:")) {
      $stamp = [string]$review.submitted_at
      if (-not $stamp) { $stamp = [string]$review.created_at }
      try {
        $ts = [DateTimeOffset]::Parse($stamp).ToUnixTimeMilliseconds()
      }
      catch {
        $ts = 0
      }
      $events.Add([PSCustomObject]@{
          body = [string]$review.body
          ts   = $ts
        })
    }
  }

  if ($events.Count -eq 0) {
    return [PSCustomObject]@{
      verdict = "NOT_FOUND"
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
    line    = $verdictLine
  }
}

$gh = Get-GhCommand
$resolvedRepo = (Resolve-Path $RepoPath).Path
Set-Location $resolvedRepo

if (-not $env:GH_TOKEN -and -not $env:GITHUB_TOKEN) {
  $null = & $gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) { throw "gh auth is not ready. Run: gh auth login" }
}

$repoFullName = Get-RepoFullName -Gh $gh
$triggerBody = "/funnel-a gate`n`n[LOCAL:GATE_TRIGGER] $(Get-Date -Format o)"
& $gh pr comment $PrNumber --body $triggerBody
if ($LASTEXITCODE -ne 0) { throw "Failed to post /funnel-a gate trigger on PR #$PrNumber." }

if ($WaitForResult) {
  if ($PollSeconds -lt 5) { $PollSeconds = 5 }
  Start-Sleep -Seconds $PollSeconds
}

$run = TryGet-LatestGateRun -Gh $gh -RepoFullName $repoFullName -PullRequestNumber $PrNumber
$verdictInfo = Get-LatestVerdict -Gh $gh -RepoFullName $repoFullName -PullRequestNumber $PrNumber

$runUrl = if ($run) { [string]$run.html_url } else { "not-found" }
$runStatus = if ($run) { [string]$run.status } else { "unknown" }
$runConclusion = if ($run -and $run.conclusion) { [string]$run.conclusion } else { "unknown" }

$summary = @(
  "pr: #$PrNumber",
  "trigger: /funnel-a gate",
  "gate run url: $runUrl",
  "gate run status: $runStatus",
  "gate run conclusion: $runConclusion",
  "$($verdictInfo.line)"
) -join "`n"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$outPath = Join-Path $OutputDir ("funnel-a-gate-pr-{0}.md" -f $PrNumber)
$summary | Set-Content -Path $outPath -Encoding UTF8

Write-Host $summary
Write-Host ""
Write-Host "Saved gate artifact: $outPath"
