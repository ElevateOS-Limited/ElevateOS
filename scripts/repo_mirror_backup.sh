#!/usr/bin/env bash
set -euo pipefail
REMOTE_NAME="${1:-mirror}"
TARGET_URL="${2:-}"
if [ -z "$TARGET_URL" ]; then
  echo "Usage: $0 <remote-name> <mirror-url>"
  exit 1
fi
if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then git remote set-url "$REMOTE_NAME" "$TARGET_URL"; else git remote add "$REMOTE_NAME" "$TARGET_URL"; fi
git push --mirror "$REMOTE_NAME"
