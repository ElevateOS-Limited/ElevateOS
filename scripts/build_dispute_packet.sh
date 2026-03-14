#!/usr/bin/env bash
set -euo pipefail
BASE="/root/.openclaw/workspace/artifacts/legal_protection_pack"
DATE="$(date +%F)"
OUT="$BASE/dispute_packets/$DATE"
mkdir -p "$OUT"
cp "$BASE/02_ip_provenance_ledger.md" "$OUT/" 2>/dev/null || true
cp "$BASE/07_infrastructure_control_map.md" "$OUT/" 2>/dev/null || true
cp "$BASE/09_dispute_response_playbook.md" "$OUT/" 2>/dev/null || true
cd /root/.openclaw/workspace
git log --date=iso --pretty=format:'%H|%an|%ad|%s' -n 200 > "$OUT/commit_evidence.txt" || true
( cd "$OUT" && find . -type f | sort | xargs sha256sum > SHA256SUMS.txt )
echo "dispute packet built: $OUT"
