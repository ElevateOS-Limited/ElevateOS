#!/usr/bin/env bash
set -euo pipefail
BASE="/root/.openclaw/workspace/artifacts/legal_protection_pack"
DATE="$(date +%F)"
OUT="$BASE/snapshots/$DATE"
mkdir -p "$OUT"
cd /root/.openclaw/workspace
git rev-parse HEAD > "$OUT/head.txt" || true
git log --date=iso --pretty=format:'%H|%an|%ad|%s' -n 500 > "$OUT/git_log_500.txt" || true
( cd "$OUT" && find . -type f | sort | xargs sha256sum > SHA256SUMS.txt )
echo "$(date -Iseconds) | snapshot=$OUT" >> "$BASE/snapshot_runs.log"
echo "snapshot complete: $OUT"
