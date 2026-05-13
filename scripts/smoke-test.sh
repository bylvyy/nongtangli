#!/usr/bin/env bash
# Phase A smoke test. Run AFTER `npm run pages:dev` is up on :8788.
# Hits every public + admin endpoint and prints a one-line PASS/FAIL.
#
# Usage:
#   ./scripts/smoke-test.sh                    # uses default localhost:8788
#   BASE=https://nongtangli.pages.dev ./scripts/smoke-test.sh

set -u

BASE=${BASE:-http://localhost:8788}
USER=${ADMIN_USERNAME:-admin}
PASS=${ADMIN_PASSWORD:-nong-dev-2026}

ok=0
fail=0

run() {
  local name=$1
  local expected=$2
  shift 2
  local actual
  actual=$(curl -s -o /dev/null -w '%{http_code}' "$@") || actual='???'
  if [[ "$actual" == "$expected" ]]; then
    printf '  \033[32mPASS\033[0m  %-40s  %s\n' "$name" "$actual"
    ok=$((ok + 1))
  else
    printf '  \033[31mFAIL\033[0m  %-40s  got=%s want=%s\n' "$name" "$actual" "$expected"
    fail=$((fail + 1))
  fi
}

echo "=== Phase A smoke test against $BASE ==="

# Public reads
run "GET /api/routes (200)" 200 "$BASE/api/routes"
run "GET /api/routes/wukang-wuyuan" 200 "$BASE/api/routes/wukang-wuyuan"
run "GET /api/routes/does-not-exist" 404 "$BASE/api/routes/does-not-exist"

# Public writes — happy path
run "POST /api/ratings" 200 -X POST "$BASE/api/ratings" \
  -H 'Content-Type: application/json' \
  -d '{"routeId":"wukang-wuyuan","stars":5,"comment":"smoke-test rating","clientId":"smoke"}'

run "POST /api/ratings invalid stars (400)" 400 -X POST "$BASE/api/ratings" \
  -H 'Content-Type: application/json' \
  -d '{"routeId":"wukang-wuyuan","stars":9}'

run "POST /api/feedback" 200 -X POST "$BASE/api/feedback" \
  -H 'Content-Type: application/json' \
  -d '{"category":"general","message":"smoke-test feedback","page":"/"}'

# Admin gates
run "Admin no auth (401)" 401 "$BASE/api/admin/feedback"
run "Admin wrong pass (401)" 401 -u "$USER:wrong" "$BASE/api/admin/feedback"

# Admin happy path
run "GET /api/admin/feedback (auth)" 200 -u "$USER:$PASS" "$BASE/api/admin/feedback"
run "GET /api/admin/ratings (auth)" 200 -u "$USER:$PASS" "$BASE/api/admin/ratings"
run "GET /api/admin/routes (auth)" 200 -u "$USER:$PASS" "$BASE/api/admin/routes"

# Show a small data sample
echo
echo "--- /api/admin/ratings summary ---"
curl -s -u "$USER:$PASS" "$BASE/api/admin/ratings" | head -c 400; echo
echo "--- /api/admin/feedback latest ---"
curl -s -u "$USER:$PASS" "$BASE/api/admin/feedback" | head -c 400; echo

echo
echo "=== $ok passed, $fail failed ==="
exit $fail
