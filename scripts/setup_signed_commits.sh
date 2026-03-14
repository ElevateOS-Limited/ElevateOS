#!/usr/bin/env bash
set -euo pipefail
echo "commit.gpgsign=$(git config --get commit.gpgsign || echo unset)"
echo "user.signingkey=$(git config --get user.signingkey || echo unset)"
echo "Run: git config commit.gpgsign true"
echo "Run: git config user.signingkey <YOUR_KEY_ID>"
