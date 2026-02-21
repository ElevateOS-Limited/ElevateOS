#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
BASE="/root/.openclaw/workspace/backups/daily"
DL="/root/Downloads"
APP_DIR="/root/.openclaw/workspace/edutech-demo"
CRY_DIR="/home/crystalcentury/public_html"
THINK_DIR="/home/crystalcentury/thinkcollegelevel.com"
DEMO_DIR="/home/crystalcentury/demo"

mkdir -p "$BASE" "$DL"

log(){ echo "[$(date '+%F %T')] $*"; }

# ---------- appdemo (Next.js + Postgres) ----------
if [[ -d "$APP_DIR" ]]; then
  log "Backing up appdemo..."
  SRC_ZIP="$BASE/appdemo-source-$TS.zip"
  FAST_ZIP="$BASE/appdemo-fast-$TS.zip"
  DB_DUMP="$BASE/appdemo-db-$TS.sql.gz"

  cd /root/.openclaw/workspace
  zip -qr "$SRC_ZIP" edutech-demo -x 'edutech-demo/node_modules/*' 'edutech-demo/.git/*' 'edutech-demo/.next/*' 'edutech-demo/*.log'
  zip -qr "$FAST_ZIP" edutech-demo -x 'edutech-demo/node_modules/*' 'edutech-demo/.git/*' 'edutech-demo/.next/cache/*' 'edutech-demo/*.log'

  DB_URL=$(grep '^DATABASE_URL=' "$APP_DIR/.env" | head -n1 | cut -d= -f2- | tr -d '"')
  # expected format: postgresql://user:pass@host:port/db
  PGUSER=$(echo "$DB_URL" | sed -E 's#postgres(ql)?://([^:]+):.*#\2#')
  PGPASS=$(echo "$DB_URL" | sed -E 's#postgres(ql)?://[^:]+:([^@]+)@.*#\2#')
  PGHOST=$(echo "$DB_URL" | sed -E 's#postgres(ql)?://[^@]+@([^:/]+).*#\2#')
  PGDB=$(echo "$DB_URL" | sed -E 's#.*/([^/?]+)(\?.*)?$#\1#')

  PGPASSWORD="$PGPASS" pg_dump -h "$PGHOST" -U "$PGUSER" "$PGDB" | gzip > "$DB_DUMP"

  cp -f /root/Downloads/restore-appdemo.sh "$BASE/restore-appdemo.sh" 2>/dev/null || true
  if [[ ! -f "$BASE/restore-appdemo.sh" ]]; then
    cat > "$BASE/restore-appdemo.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
APP_ZIP="${1:-appdemo-source-latest.zip}"
DB_DUMP="${2:-appdemo-db-latest.sql.gz}"
DB_PASS="${3:-}"
[[ -n "$DB_PASS" ]] || { echo "Usage: $0 <app-zip> <db-dump> <postgres-pass>"; exit 1; }
unzip -o "$APP_ZIP"
cd edutech-demo
npm ci
npx prisma generate
gunzip -c "$DB_DUMP" | PGPASSWORD="$DB_PASS" psql -h localhost -U postgres edutech
npm run build
pm2 delete edutech-demo >/dev/null 2>&1 || true
pm2 start "npm start -- -p 3000" --name edutech-demo --max-memory-restart 500M --restart-delay 5000
pm2 save
EOF
    chmod +x "$BASE/restore-appdemo.sh"
  fi

  ln -sfn "$(basename "$SRC_ZIP")" "$BASE/appdemo-source-latest.zip"
  ln -sfn "$(basename "$FAST_ZIP")" "$BASE/appdemo-fast-latest.zip"
  ln -sfn "$(basename "$DB_DUMP")" "$BASE/appdemo-db-latest.sql.gz"
fi

# ---------- crystalcentury (WordPress + MySQL) ----------
if [[ -d "$CRY_DIR" ]]; then
  log "Backing up crystalcentury..."
  CRY_SRC="$BASE/crystalcentury-source-$TS.tar.gz"
  CRY_DB="$BASE/crystalcentury-db-$TS.sql.gz"

  tar --warning=no-file-changed --ignore-failed-read -C /home/crystalcentury -czf "$CRY_SRC" public_html

  DB_NAME=$(grep "DB_NAME" "$CRY_DIR/wp-config.php" | sed -E "s/.*'([^']+)'.*/\1/")
  DB_USER=$(grep "DB_USER" "$CRY_DIR/wp-config.php" | sed -E "s/.*'([^']+)'.*/\1/")
  DB_PASS=$(grep "DB_PASSWORD" "$CRY_DIR/wp-config.php" | sed -E "s/.*'([^']+)'.*/\1/")
  DB_HOST=$(grep "DB_HOST" "$CRY_DIR/wp-config.php" | sed -E "s/.*'([^']+)'.*/\1/")

  CNF=$(mktemp)
  chmod 600 "$CNF"
  cat > "$CNF" <<EOF
[client]
user=$DB_USER
password=$DB_PASS
host=$DB_HOST
EOF
  mysqldump --defaults-extra-file="$CNF" "$DB_NAME" | gzip > "$CRY_DB"
  rm -f "$CNF"

  cat > "$BASE/restore-crystalcentury.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
SRC_TAR="${1:-crystalcentury-source-latest.tar.gz}"
DB_DUMP="${2:-crystalcentury-db-latest.sql.gz}"
DB_NAME="${3:-crystalcentury_db}"
DB_USER="${4:-}"
DB_PASS="${5:-}"
DB_HOST="${6:-localhost}"
[[ -n "$DB_USER" && -n "$DB_PASS" ]] || { echo "Usage: $0 <src-tar> <db-dump> <db-name> <db-user> <db-pass> [db-host]"; exit 1; }
tar -xzf "$SRC_TAR" -C /home/crystalcentury
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS \\`$DB_NAME\\`;"
gunzip -c "$DB_DUMP" | mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME"
EOF
  chmod +x "$BASE/restore-crystalcentury.sh"

  ln -sfn "$(basename "$CRY_SRC")" "$BASE/crystalcentury-source-latest.tar.gz"
  ln -sfn "$(basename "$CRY_DB")" "$BASE/crystalcentury-db-latest.sql.gz"
fi

# ---------- thinkcollegelevel (static) ----------
if [[ -d "$THINK_DIR" ]]; then
  log "Backing up thinkcollegelevel..."
  THINK_SRC="$BASE/thinkcollegelevel-source-$TS.tar.gz"
  tar -C /home/crystalcentury -czf "$THINK_SRC" thinkcollegelevel.com
  cat > "$BASE/restore-thinkcollegelevel.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
SRC_TAR="${1:-thinkcollegelevel-source-latest.tar.gz}"
tar -xzf "$SRC_TAR" -C /home/crystalcentury
EOF
  chmod +x "$BASE/restore-thinkcollegelevel.sh"
  ln -sfn "$(basename "$THINK_SRC")" "$BASE/thinkcollegelevel-source-latest.tar.gz"
fi

# ---------- demo (if exists) ----------
if [[ -d "$DEMO_DIR" ]]; then
  log "Backing up demo..."
  DEMO_SRC="$BASE/demo-source-$TS.tar.gz"
  tar -C /home/crystalcentury -czf "$DEMO_SRC" demo
  cat > "$BASE/restore-demo.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
SRC_TAR="${1:-demo-source-latest.tar.gz}"
tar -xzf "$SRC_TAR" -C /home/crystalcentury
EOF
  chmod +x "$BASE/restore-demo.sh"
  ln -sfn "$(basename "$DEMO_SRC")" "$BASE/demo-source-latest.tar.gz"
else
  log "demo directory not found; skipping demo backup"
fi

# mirror latest artifacts + restore scripts to /root/Downloads for easy pulling
for f in "$BASE"/*latest* "$BASE"/restore-*.sh; do
  [[ -e "$f" ]] || continue
  cp -fL "$f" "$DL/"
done

# retention: keep 21 days of timestamped artifacts
find "$BASE" -type f -mtime +21 -name '*-20*.zip' -delete || true
find "$BASE" -type f -mtime +21 -name '*-20*.tar.gz' -delete || true
find "$BASE" -type f -mtime +21 -name '*-20*.sql.gz' -delete || true

log "Done. Latest artifacts copied to $DL"
