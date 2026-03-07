[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [int]$PrNumber,

  [Parameter(Mandatory = $true)]
  [string]$Part,

  [Parameter(Mandatory = $true)]
  [string]$NextAction,

  [string]$RepoPath = ".",

  [string]$Commit = "",

  [string[]]$FilesChanged = @(),

  [string]$GateRunUrl = "",

  [string]$MergeVerdict = "",

  [string]$Blockers = "none",

  [switch]$PostToPr,

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

function Get-LatestCommitContext([string]$Gh, [string]$RepoFullName, [int]$PullRequestNumber) {
  $commitsJson = & $Gh api "repos/$RepoFullName/pulls/$PullRequestNumber/commits?per_page=100"
  if ($LASTEXITCODE -ne 0 -or -not $commitsJson) {
    throw "Unable to fetch commits for PR #$PullRequestNumber."
  }

  $commits = @($commitsJson | ConvertFrom-Json)
  if ($commits.Count -eq 0) {
    throw "PR #$PullRequestNumber has no commits."
  }

  $ranked = foreach ($commit in $commits) {
    $stamp = [string]$commit.commit.committer.date
    if (-not $stamp) { $stamp = [string]$commit.commit.author.date }
    try {
      $ts = [DateTimeOffset]::Parse($stamp).ToUnixTimeMilliseconds()
    }
    catch {
      $ts = 0
    }
    [PSCustomObject]@{
      sha = [string]$commit.sha
      ts  = $ts
    }
  }

  $latest = @($ranked | Sort-Object ts -Descending)[0]
  $detailJson = & $Gh api "repos/$RepoFullName/commits/$($latest.sha)"
  if ($LASTEXITCODE -ne 0 -or -not $detailJson) {
    throw "Unable to fetch commit detail for $($latest.sha)."
  }

  $detail = $detailJson | ConvertFrom-Json
  $files = @($detail.files | ForEach-Object { [string]$_.filename } | Where-Object { $_ } | Sort-Object -Unique)

  return [PSCustomObject]@{
    shaShort = $latest.sha.Substring(0, [Math]::Min(7, $latest.sha.Length))
    files    = $files
  }
}

function TryGet-LatestGateRun([string]$Gh, [string]$RepoFullName, [int]$PullRequestNumber) {
  try {
    $runsJson = & $Gh api "repos/$RepoFullName/actions/workflows/pr-governance-gate.yml/runs?per_page=40" 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $runsJson) { return $null }

    $runsResponse = $runsJson | ConvertFrom-Json
    $runs = @($runsResponse.workflow_runs)
    if ($runs.Count -eq 0) { return $null }

    $matching = foreach ($run in $runs) {
      $linked = @($run.pull_requests | ForEach-Object { [int]$_.number })
      if ($linked -contains $PullRequestNumber) { $run }
    }

    if (-not $matching) { return $null }
    return @($matching | Sort-Object created_at -Descending)[0]
  }
  catch {
    return $null
  }
}

function Get-LatestVerdict([string]$Gh, [string]$RepoFullName, [int]$PullRequestNumber) {
  $events = New-Object System.Collections.Generic.List[object]

  $commentsJson = & $Gh api "repos/$RepoFullName/issues/$PullRequestNumber/comments?per_page=100"
  if ($LASTEXITCODE -eq 0 -and $commentsJson) {
    $comments = @($commentsJson | ConvertFrom-Json)
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
  }

  $reviewsJson = & $Gh api "repos/$RepoFullName/pulls/$PullRequestNumber/reviews?per_page=100"
  if ($LASTEXITCODE -eq 0 -and $reviewsJson) {
    $reviews = @($reviewsJson | ConvertFrom-Json)
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
  }

  if ($events.Count -eq 0) {
    return "NOT_FOUND"
  }

  $latest = @($events | Sort-Object ts -Descending)[0]
  $line = @([string]$latest.body -split "`n" | Where-Object { $_ -match "merge verdict:" } | Select-Object -First 1)
  $verdictLine = if ($line) { $line[0].Trim() } else { "merge verdict: UNKNOWN" }

  if ($verdictLine -match 'merge verdict:\s*([A-Z_]+)') {
    return $Matches[1]
  }
  return "UNKNOWN"
}

$gh = Get-GhCommand
$resolvedRepo = (Resolve-Path $RepoPath).Path
Set-Location $resolvedRepo

if (-not $env:GH_TOKEN -and -not $env:GITHUB_TOKEN) {
  $null = & $gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) { throw "gh auth is not ready. Run: gh auth login" }
}

$repoFullName = Get-RepoFullName -Gh $gh

if (-not $Commit -or $FilesChanged.Count -eq 0) {
  $context = Get-LatestCommitContext -Gh $gh -RepoFullName $repoFullName -PullRequestNumber $PrNumber
  if (-not $Commit) { $Commit = [string]$context.shaShort }
  if ($FilesChanged.Count -eq 0) { $FilesChanged = @($context.files) }
}

if (-not $MergeVerdict) {
  $MergeVerdict = Get-LatestVerdict -Gh $gh -RepoFullName $repoFullName -PullRequestNumber $PrNumber
}

if (-not $GateRunUrl) {
  $run = TryGet-LatestGateRun -Gh $gh -RepoFullName $repoFullName -PullRequestNumber $PrNumber
  if ($run -and $run.html_url) {
    $GateRunUrl = [string]$run.html_url
  } else {
    $GateRunUrl = "not-found"
  }
}

$fileList = @($FilesChanged | Where-Object { $_ } | Sort-Object -Unique)
if ($fileList.Count -eq 0) {
  $fileList = @("none-captured")
}

$statusBody = @(
  "part: $Part",
  "commit: $Commit",
  "files changed: $($fileList -join ', ')",
  "gate run url: $GateRunUrl",
  "merge verdict: $MergeVerdict",
  "blockers: $Blockers",
  "next action (next 60 min): $NextAction"
) -join "`n"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$outPath = Join-Path $OutputDir ("funnel-a-status-pr-{0}.md" -f $PrNumber)
$statusBody | Set-Content -Path $outPath -Encoding UTF8

Write-Host $statusBody
Write-Host ""
Write-Host "Saved status artifact: $outPath"

if ($PostToPr) {
  & $gh pr comment $PrNumber --body $statusBody
  if ($LASTEXITCODE -ne 0) { throw "Failed to post status comment on PR #$PrNumber." }
  Write-Host "Posted status comment on PR #$PrNumber."
}
