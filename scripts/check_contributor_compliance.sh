#!/usr/bin/env bash
set -euo pipefail
REG="/root/.openclaw/workspace/artifacts/legal_protection_pack/contributors/registry.csv"
[ -f "$REG" ] || { echo "missing registry"; exit 2; }
awk -F',' 'NR>1 { if ($4 != "approved") { print "NON_APPROVED: "$1; bad=1 } if ($3 == "") { print "MISSING_AGREEMENT_PATH: "$1; bad=1 } } END{ exit bad }' "$REG"
echo "contributor compliance PASS"
