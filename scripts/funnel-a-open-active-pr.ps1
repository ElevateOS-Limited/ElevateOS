[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Part,

  [string]$Title = "",

  [string]$RepoPath = ".",

  [string]$BaseBranch = "main",

  [string]$ActiveLabel = "funnel-a-active",

  [switch]$Kickoff,

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

function Slugify([string]$Input) {
  $slug = ($Input.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
  if (-not $slug) { return "backend-slice" }
  return $slug
}

function Ensure-LabelExists([string]$Gh, [string]$Label) {
  $labelsJson = & $Gh label list --limit 200 --json name
  if ($LASTEXITCODE -ne 0 -or -not $labelsJson) { throw "Unable to list repository labels." }
  $labels = @($labelsJson | ConvertFrom-Json | ForEach-Object { [string]$_.name })
  if ($labels -contains $Label) { return }

  & $Gh label create $Label --color "0e8a16" --description "Single active Funnel A PR"
  if ($LASTEXITCODE -ne 0) { throw "Failed to create label '$Label'." }
}

function Extract-PrNumber([string]$PrUrl) {
  if ($PrUrl -match '/pull/(\d+)$') { return [int]$Matches[1] }
  throw "Unable to parse PR number from URL: $PrUrl"
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

$branch = (& $git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) { throw "Unable to detect current branch." }
if ($branch -eq $BaseBranch) {
  throw "Current branch is '$BaseBranch'. Switch to a feature branch before creating PR."
}

& $git push -u origin $branch
if ($LASTEXITCODE -ne 0) { throw "Failed to push branch '$branch' to origin." }

$existingJson = & $gh pr list --state open --head $branch --base $BaseBranch --limit 1 --json number,title,url
if ($LASTEXITCODE -ne 0) { throw "Failed to query existing PR for branch '$branch'." }
$existing = @($existingJson | ConvertFrom-Json)

$prNumber = 0
$prUrl = ""
$prTitle = ""

if ($existing.Count -gt 0) {
  $prNumber = [int]$existing[0].number
  $prUrl = [string]$existing[0].url
  $prTitle = [string]$existing[0].title
} else {
  if (-not $Title) {
    $Title = "feat(funnel-a): $(Slugify $Part) backend slice"
  }

  $prBody = @(
    "## Scope",
    "- Backend slice for $Part.",
    "- Preserve auth, demo mode, and build stability.",
    "- Keep server-side RBAC and org-scope enforcement intact.",
    "",
    "repo = ElevateOS-Limited/elevateos",
    "base branch = main",
    "",
    "## Acceptance checks run",
    "- npm run build -> PENDING",
    "",
    "## Rollback note",
    "- Revert branch commits with `git revert <hash>` if needed.",
    "",
    "## Migration note",
    "- None."
  ) -join "`n"

  $prUrl = (& $gh pr create --base $BaseBranch --head $branch --title $Title --body $prBody).Trim()
  if ($LASTEXITCODE -ne 0 -or -not $prUrl) { throw "Failed to create PR from branch '$branch'." }

  $prNumber = Extract-PrNumber -PrUrl $prUrl
  $prTitle = $Title
}

Ensure-LabelExists -Gh $gh -Label $ActiveLabel
& $gh pr edit $prNumber --add-label $ActiveLabel
if ($LASTEXITCODE -ne 0) { throw "Failed to add label '$ActiveLabel' to PR #$prNumber." }

if ($Kickoff) {
  $kickoffBody = @(
    "[LOCAL:AUTOPILOT_BOOTSTRAP]",
    "",
    "part: $Part",
    "status: PR is active for backend autopilot loop.",
    "",
    "Required now:",
    "1. Implement backend slice changes.",
    "2. Trigger gate and patch until APPROVE.",
    "",
    "@codex address that feedback",
    "/funnel-a gate"
  ) -join "`n"

  & $gh pr comment $prNumber --body $kickoffBody
  if ($LASTEXITCODE -ne 0) { throw "Failed to post kickoff comment on PR #$prNumber." }
}

$summary = @(
  "part: $Part",
  "branch: $branch",
  "pr: #$prNumber",
  "title: $prTitle",
  "url: $prUrl",
  "label: $ActiveLabel",
  "kickoff: $Kickoff"
) -join "`n"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$outPath = Join-Path $OutputDir ("funnel-a-open-pr-{0}.md" -f $prNumber)
$summary | Set-Content -Path $outPath -Encoding UTF8

Write-Host $summary
Write-Host ""
Write-Host "Saved PR bootstrap artifact: $outPath"
