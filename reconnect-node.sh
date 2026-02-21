#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./reconnect-node.sh <gateway_token>
# Example:
#   ./reconnect-node.sh d88dbf7b635e...

TOKEN="${1:-}"
if [[ -z "$TOKEN" ]]; then
  echo "Usage: $0 <gateway_token>"
  exit 1
fi

HOST="cloud-8873e6.managed-vps.net"
PORT="443"

openclaw update || true
openclaw config set gateway.auth.mode '"token"'
openclaw config set gateway.auth.token '"'"$TOKEN"'"'
openclaw node install --host "$HOST" --port "$PORT" --tls --force
systemctl --user daemon-reload
systemctl --user restart openclaw-node.service
systemctl --user status openclaw-node.service --no-pager -l

echo "Done. If still disconnected, run:"
echo "journalctl --user -u openclaw-node.service -n 120 --no-pager"
