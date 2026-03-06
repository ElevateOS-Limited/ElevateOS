$gh = (Get-Command gh -ErrorAction SilentlyContinue)?.Source
if (-not $gh) {
  $fallback = "C:\Program Files\GitHub CLI\gh.exe"
  if (Test-Path $fallback) { $gh = $fallback } else { throw "gh not found" }
}

& $gh alias set --clobber pr-open "pr list --state open --limit 30 --json number,title,headRefName,baseRefName,author,url"
& $gh alias set --clobber pr-risk "pr view `$1 --json number,title,headRefName,baseRefName,author,url,files"
& $gh alias set --clobber pr-co "pr checkout `$1"
& $gh alias set --clobber pr-gate "!pwsh -NoProfile -File ./scripts/review-pr.ps1 -PrNumber `$1 -RepoPath ."
& $gh alias set --clobber pr-loop "!pwsh -NoProfile -File ./scripts/review-pr.ps1 -PrNumber `$1 -RepoPath . -PostReviewDecision"
& $gh alias set --clobber pr-loop-build "!pwsh -NoProfile -File ./scripts/review-pr.ps1 -PrNumber `$1 -RepoPath . -RunBuild -PostReviewDecision"

Write-Host "Configured aliases:"
& $gh alias list
