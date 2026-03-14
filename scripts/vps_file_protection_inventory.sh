#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-/root}"
OUTBASE="/root/.openclaw/workspace/artifacts/legal_protection_pack/vps_inventory"
STAMP="$(date +%F_%H%M%S)"
OUT="$OUTBASE/$STAMP"
mkdir -p "$OUT"
find "$TARGET" -type f 2>/dev/null | sort > "$OUT/files.txt"
# Hash list may take time on large trees
xargs -a "$OUT/files.txt" sha256sum > "$OUT/SHA256SUMS.txt" 2>/dev/null || true
echo "inventory complete: $OUT"
