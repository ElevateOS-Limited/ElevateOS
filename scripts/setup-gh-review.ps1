Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$gh = (Get-Command gh -ErrorAction SilentlyContinue)?.Source
if (-not $gh) {
  $fallback = "C:\Program Files\GitHub CLI\gh.exe"
  if (Test-Path $fallback) { $gh = $fallback } else { throw "gh not found" }
}

# Keep global gh protocol aligned with current authenticated host state.
& $gh config set git_protocol ssh

$requiredAliases = [ordered]@{
  "pr-open" = "pr list --state open --limit 30 --json number,title,headRefName,baseRefName,author,url"
  "pr-risk" = "pr view `$1 --json number,title,headRefName,baseRefName,author,url,files"
  "pr-co" = "pr checkout `$1"
  "pr-gate" = "!pwsh -NoProfile -File ./scripts/review-pr.ps1 -PrNumber `$1 -RepoPath ."
  "pr-loop" = "!pwsh -NoProfile -File ./scripts/review-pr.ps1 -PrNumber `$1 -RepoPath . -PostReviewDecision"
  "pr-loop-build" = "!pwsh -NoProfile -File ./scripts/review-pr.ps1 -PrNumber `$1 -RepoPath . -RunBuild -PostReviewDecision"
}

$staleAliases = @(
  "pr-funnel-gate",
  "pr-funnel-status",
  "pr-funnel-open",
  "pr-funnel-auto",
  "pr-funnel-daemon",
  "ops-openclaw-daily"
)

foreach ($aliasName in $staleAliases) {
  & $gh alias delete $aliasName 2>$null
}

foreach ($entry in $requiredAliases.GetEnumerator()) {
  & $gh alias set --clobber $entry.Key $entry.Value
}

Write-Host "Configured aliases:"
& $gh alias list
