[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [int]$PrNumber,

  [string]$RepoPath = ".",

  [switch]$RunBuild,

  [switch]$PostReviewComment,

  [switch]$PostReviewDecision,

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

function Get-RepoSlugFromPrUrl([string]$PrUrl) {
  if ([string]::IsNullOrWhiteSpace($PrUrl)) {
    throw "Cannot resolve repository slug: PR URL is empty."
  }

  $match = [regex]::Match($PrUrl, '^https?://[^/]+/([^/]+)/([^/]+)/pull/\d+/?$')
  if (-not $match.Success) {
    throw "Cannot resolve repository slug from PR URL: $PrUrl"
  }

  return @{
    Owner = $match.Groups[1].Value
    Repo  = $match.Groups[2].Value
  }
}

function Get-RiskArea([string]$Path) {
  if ($Path -in @("AGENTS.md", "MASTER_TASK_BOARD.md", "PROGRESS_LOG.md", "HEARTBEAT.md", "POSTMORTEM.md")) { return "control-loop" }
  if ($Path -like "src/app/api/*" -or $Path -like "src/lib/auth/*") { return "tenant-rbac-api" }
  if ($Path -like "prisma/*" -or $Path -like "src/lib/db/*") { return "persistence" }
  if ($Path -like "src/app/dashboard/*" -or $Path -like "src/app/*/page.tsx") { return "ui-flow" }
  if ($Path -in @("package.json", "package-lock.json") -or $Path -like ".github/*" -or $Path -like "next.config.*") { return "security-toolchain" }
  return "other"
}

function Add-Blocker([System.Collections.Generic.List[string]]$List, [string]$Message) {
  if (-not $List.Contains($Message)) { $List.Add($Message) }
}

$gh = Get-GhCommand
$resolvedRepo = (Resolve-Path $RepoPath).Path
Set-Location $resolvedRepo

if (-not $env:GH_TOKEN -and -not $env:GITHUB_TOKEN) {
  $null = & $gh auth status 2>&1
  if ($LASTEXITCODE -ne 0) { throw "gh auth is not ready. Run: gh auth login" }
}

$prJson = & $gh pr view $PrNumber --json number,title,body,headRefName,baseRefName,author,url
if ($LASTEXITCODE -ne 0 -or -not $prJson) { throw "Unable to load PR #$PrNumber." }
$pr = $prJson | ConvertFrom-Json
$repoSlug = Get-RepoSlugFromPrUrl -PrUrl $pr.url

$changedFiles = @()
$page = 1
while ($true) {
  $filesJson = & $gh api "repos/$($repoSlug.Owner)/$($repoSlug.Repo)/pulls/$PrNumber/files?per_page=100&page=$page"
  if ($LASTEXITCODE -ne 0 -or -not $filesJson) { throw "Unable to load changed files for PR #$PrNumber (page $page)." }
  $batch = @($filesJson | ConvertFrom-Json)
  if ($batch.Count -eq 0) { break }
  $changedFiles += $batch
  if ($batch.Count -lt 100) { break }
  $page += 1
}

$paths = @($changedFiles | ForEach-Object { $_.filename })
$grouped = $paths | Group-Object { Get-RiskArea $_ } | Sort-Object Name

$blockers = [System.Collections.Generic.List[string]]::new()
$minimalFixes = [System.Collections.Generic.List[string]]::new()

if ($pr.baseRefName -ne "main") {
  Add-Blocker $blockers "Base branch is '$($pr.baseRefName)', expected 'main'."
  $minimalFixes.Add("Retarget PR #$PrNumber to base branch 'main'.")
}

$deletedControl = @($changedFiles | Where-Object {
  $_.status -eq "removed" -and $_.filename -in @("AGENTS.md", "MASTER_TASK_BOARD.md", "PROGRESS_LOG.md", "HEARTBEAT.md", "POSTMORTEM.md")
})
if ($deletedControl.Count -gt 0) {
  Add-Blocker $blockers "Control-loop files removed: $($deletedControl.filename -join ', ')."
  $minimalFixes.Add("Restore removed control-loop files.")
}

$placeholderHits = [System.Collections.Generic.List[string]]::new()
foreach ($file in $changedFiles) {
  if (($file.filename -notlike "src/*") -and ($file.filename -notlike "prisma/*")) { continue }
  $patch = if ($file.PSObject.Properties.Name -contains "patch") { [string]$file.patch } else { "" }
  if (-not $patch) { continue }
  $addedLines = @($patch -split "`n" | Where-Object { $_ -match '^\+(?!\+\+)' })
  $hasPlaceholderMarker = $false
  foreach ($line in $addedLines) {
    if (
      ($line -match "(?i)\b(TODO|FIXME|placeholder|lorem)\b") -and
      ($line -notmatch "TODO\|FIXME\|placeholder\|lorem") -and
      ($line -notmatch "\\b\(TODO\|FIXME\|placeholder\|lorem\)\\b")
    ) {
      $hasPlaceholderMarker = $true
      break
    }
  }
  if ($hasPlaceholderMarker) {
    $placeholderHits.Add($file.filename)
  }
}
if ($placeholderHits.Count -gt 0) {
  $placeholderList = ($placeholderHits | Sort-Object -Unique)
  Add-Blocker $blockers "Placeholder/fake-completion markers found in diff: $($placeholderList -join ', ')."
  $minimalFixes.Add("Remove placeholder markers and ship real logic only.")
}

$criticalApiPattern = '^src/app/api/(worksheets/generate|worksheets|feedback|notes|classes(?:/.+)?|students(?:/.+)?|assessments(?:/.+)?|reports/monthly(?:/.+)?)/route\.(ts|tsx)$'
$criticalApiFiles = @($paths | Where-Object { $_ -match $criticalApiPattern })
foreach ($path in $criticalApiFiles) {
  $entry = $changedFiles | Where-Object { $_.filename -eq $path } | Select-Object -First 1
  if (-not $entry) { continue }
  $patch = if ($entry.PSObject.Properties.Name -contains "patch") { [string]$entry.patch } else { "" }
  if (-not $patch) { continue }

  $addsWriteHandler = $patch -match "(?m)^\+(?!\+\+)\s*export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\s*\("
  $mentionsRoleGuard = $patch -match "(?m)^\+(?!\+\+).*(requireRole|hasRole|assertRole|ensureRole|allowedRoles|roles\.ts)"
  $removesRoleGuard = $patch -match "(?m)^-(?!--).*(requireRole|hasRole|assertRole|ensureRole|allowedRoles)"
  if ($removesRoleGuard) {
    Add-Blocker $blockers "Critical route removed role-guarding logic in diff: $path."
    $minimalFixes.Add("Restore explicit server-side role guard for $path.")
  }
  if ($addsWriteHandler -and -not $mentionsRoleGuard) {
    Add-Blocker $blockers "Critical write route updated without explicit role-guard signal in diff: $path."
    $minimalFixes.Add("Add explicit server-side role guard to $path (UI gating alone is insufficient).")
  }

  $addsPrismaOp = $patch -match "(?m)^\+(?!\+\+).*(prisma\..*\.(findMany|findFirst|findUnique|create|update|upsert|delete))"
  $mentionsOrg = $patch -match "(?m)^\+(?!\+\+).*\b(orgId|withOrgScope)\b"
  $removesOrgScope = $patch -match "(?m)^-(?!--).*\b(orgId|withOrgScope)\b"
  if ($removesOrgScope) {
    Add-Blocker $blockers "Critical route removed org scoping logic in diff: $path."
    $minimalFixes.Add("Restore authoritative org scoping in $path.")
  }
  if ($addsPrismaOp -and -not $mentionsOrg) {
    Add-Blocker $blockers "Critical API route updated with Prisma access but no org scoping signal in diff: $path."
    $minimalFixes.Add("Derive orgId server-side and enforce tenant scoping in $path.")
  }
}

$buildResult = "SKIPPED"
if ($RunBuild) {
  & npm run build
  if ($LASTEXITCODE -eq 0) {
    $buildResult = "PASS"
  }
  else {
    $buildResult = "FAIL"
    Add-Blocker $blockers "Build failed (`npm run build`)."
    $minimalFixes.Add("Fix build breakage before merge.")
  }
}

$verdict = if ($blockers.Count -eq 0) { "APPROVE" } else { "REQUEST_CHANGES" }
if ($minimalFixes.Count -eq 0) {
  $minimalFixes.Add("No fixes required.")
}

$groupLines = if ($grouped.Count -eq 0) {
  @("- none")
}
else {
  @($grouped | ForEach-Object {
      $riskName = $_.Name
      $items = ($paths | Where-Object { (Get-RiskArea $_) -eq $riskName } | Sort-Object) -join ", "
      "- ${riskName}: $items"
    })
}

$blockerLines = if ($blockers.Count -eq 0) { @("- none") } else { @($blockers | ForEach-Object { "- $_" }) }
$fixLines = if ($minimalFixes.Count -eq 0) { @("- none") } else { @($minimalFixes | ForEach-Object { "- $_" }) }

$commentBody = @(
  "merge verdict: $verdict",
  "",
  "blockers:",
  $blockerLines,
  "",
  "minimal fixes:",
  $fixLines
) -join "`n"

$consoleLines = [System.Collections.Generic.List[string]]::new()
@(
  "PR #$($pr.number): $($pr.title)",
  "URL: $($pr.url)",
  "Head: $($pr.headRefName)  Base: $($pr.baseRefName)",
  "Build: $buildResult",
  "",
  "Changed files grouped by risk area:"
) | ForEach-Object { [void]$consoleLines.Add($_) }
$groupLines | ForEach-Object { [void]$consoleLines.Add($_) }
@(
  "",
  "Merge verdict:",
  "$verdict",
  "",
  "Blockers:"
) | ForEach-Object { [void]$consoleLines.Add($_) }
$blockerLines | ForEach-Object { [void]$consoleLines.Add($_) }
@(
  "",
  "Minimal fixes:"
) | ForEach-Object { [void]$consoleLines.Add($_) }
$fixLines | ForEach-Object { [void]$consoleLines.Add($_) }
@(
  "",
  "Exact GitHub review comment text:",
  $commentBody
) | ForEach-Object { [void]$consoleLines.Add($_) }
$consoleOutput = $consoleLines -join "`n"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
$outPath = Join-Path $OutputDir ("review-pr-{0}.md" -f $PrNumber)
$consoleOutput | Set-Content -Path $outPath -Encoding UTF8

Write-Host $consoleOutput
Write-Host ""
Write-Host "Saved review artifact: $outPath"

if ($PostReviewComment) {
  & $gh pr review $PrNumber --comment --body $commentBody
  if ($LASTEXITCODE -ne 0) { throw "Failed to post review comment." }
  Write-Host "Posted review comment to PR #$PrNumber."
}

if ($PostReviewDecision) {
  if ($verdict -eq "APPROVE") {
    $approveOutput = & $gh pr review $PrNumber --approve --body $commentBody 2>&1
    if ($LASTEXITCODE -ne 0) {
      $joined = ($approveOutput | Out-String)
      if ($joined -match "your own pull request") {
        & $gh pr review $PrNumber --comment --body $commentBody
        if ($LASTEXITCODE -ne 0) { throw "Failed to fallback to comment review after own-PR restriction." }
        Write-Host "Posted COMMENT review to PR #$PrNumber (own-PR approve restriction)."
      }
      elseif ($joined -match "not permitted to approve pull requests") {
        & $gh pr review $PrNumber --comment --body $commentBody
        if ($LASTEXITCODE -ne 0) { throw "Failed to fallback to comment review after permission restriction." }
        Write-Host "Posted COMMENT review to PR #$PrNumber (approve permission restriction)."
      }
      else {
        throw "Failed to submit approve review. $joined"
      }
    }
    else {
      Write-Host "Submitted APPROVE review to PR #$PrNumber."
    }
  }
  else {
    $requestChangesOutput = & $gh pr review $PrNumber --request-changes --body $commentBody 2>&1
    if ($LASTEXITCODE -ne 0) {
      $joined = ($requestChangesOutput | Out-String)
      if ($joined -match "your own pull request") {
        & $gh pr review $PrNumber --comment --body $commentBody
        if ($LASTEXITCODE -ne 0) { throw "Failed to fallback to comment review after own-PR restriction." }
        Write-Host "Posted COMMENT review to PR #$PrNumber (own-PR request-changes restriction)."
      }
      elseif ($joined -match "not permitted to request changes on pull requests") {
        & $gh pr review $PrNumber --comment --body $commentBody
        if ($LASTEXITCODE -ne 0) { throw "Failed to fallback to comment review after permission restriction." }
        Write-Host "Posted COMMENT review to PR #$PrNumber (request-changes permission restriction)."
      }
      else {
        throw "Failed to submit request-changes review. $joined"
      }
    }
    else {
      Write-Host "Submitted REQUEST_CHANGES review to PR #$PrNumber."
    }
  }
}

