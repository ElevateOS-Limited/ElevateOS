#!/usr/bin/env bash
set -euo pipefail

TARGET_DOMAIN="${1:-}"
if [[ -z "$TARGET_DOMAIN" ]]; then
  echo "Usage: $0 <target-domain>" >&2
  exit 1
fi

TS="$(date +%F_%H%M%S)"
OUT="/root/.openclaw/workspace/artifacts/legal_protection_pack/vps_inventory/${TS}-preflight-${TARGET_DOMAIN}"
mkdir -p "$OUT"

echo "[info] target_domain=$TARGET_DOMAIN" | tee "$OUT/target.txt"

echo "[info] collecting vhost maps..."
(nginx -T > "$OUT/nginx-T.txt" 2>&1 || true)
(apachectl -S > "$OUT/apache-vhosts.txt" 2>&1 || httpd -S > "$OUT/apache-vhosts.txt" 2>&1 || true)

echo "[info] extracting target hits..."
grep -RIn "$TARGET_DOMAIN" /etc/nginx/conf.d /etc/httpd/vhosts > "$OUT/target-config-hits.txt" 2>/dev/null || true

echo "[info] document roots around target..."
grep -RIn "ServerName\|ServerAlias\|DocumentRoot" /etc/httpd/vhosts > "$OUT/httpd-server-docroots.txt" 2>/dev/null || true
grep -RIn "server_name\|root\|proxy_pass" /etc/nginx/conf.d > "$OUT/nginx-server-roots.txt" 2>/dev/null || true

(ss -ltnp > "$OUT/listening-ports.txt" 2>&1 || true)
(dig +short "$TARGET_DOMAIN" A > "$OUT/dns-A.txt" 2>/dev/null || true)
(dig +short "$TARGET_DOMAIN" AAAA > "$OUT/dns-AAAA.txt" 2>/dev/null || true)

(
  cd "$OUT"
  find . -type f | sort | xargs sha256sum > SHA256SUMS.txt
)

echo "[done] preflight evidence: $OUT"
