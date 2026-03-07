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
& $gh alias set --clobber pr-funnel-gate "!pwsh -NoProfile -File ./scripts/funnel-a-gate.ps1 -PrNumber `$1 -RepoPath . -WaitForResult"
& $gh alias set --clobber pr-funnel-status "!pwsh -NoProfile -File ./scripts/funnel-a-status.ps1 -PrNumber `$1 -Part `$2 -NextAction `$3 -PostToPr -RepoPath ."
& $gh alias set --clobber pr-funnel-open "!pwsh -NoProfile -File ./scripts/funnel-a-open-active-pr.ps1 -Part `$1 -Kickoff -RepoPath ."
& $gh alias set --clobber pr-funnel-auto "!pwsh -NoProfile -File ./scripts/funnel-a-autopilot.ps1 -Part `$1 -RepoPath ."

Write-Host "Configured aliases:"
& $gh alias list
