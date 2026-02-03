#!/usr/bin/env bash
set -euo pipefail
BASE=http://localhost:3000
mkdir -p src/test
rnd=$(date +%s)
EMAIL="testuser+${rnd}@example.com"
PASSWORD="password123"
USERNAME="user${rnd}"

echo "Registering $EMAIL"
curl -s -X POST "$BASE/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"username\": \"$USERNAME\", \"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"currency\": \"USD\"}" \
  -o src/test/reg.json

echo "Register response:"; cat src/test/reg.json; echo

echo "Logging in"
curl -s -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" \
  -o src/test/login.json

echo "Login response:"; cat src/test/login.json; echo

TOKEN=$(node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('src/test/login.json','utf8')); console.log(j.token||'')")
if [ -z "$TOKEN" ]; then
  echo "No token received — aborting" >&2
  exit 1
fi

echo "Token obtained"

# create transactions
TXS=( \
  '{"type":"expense","amount":12.5,"category":"food","note":"lunch"}' \
  '{"type":"expense","amount":60,"category":"transport","note":"uber"}' \
  '{"type":"income","amount":500,"category":"salary","note":"paycheck"}' \
)

i=1
for t in "${TXS[@]}"; do
  echo "Creating tx #$i"
  curl -s -X POST "$BASE/api/transactions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$t" -o src/test/tx${i}.json
  echo "Response:"; cat src/test/tx${i}.json; echo
  i=$((i+1))
done

# fetch insights
echo "Fetching insights"
curl -s -X GET "$BASE/api/insights?days=30" \
  -H "Authorization: Bearer $TOKEN" -o src/test/insights.json

echo "Insights response:"; cat src/test/insights.json; echo

echo "Smoke test finished"
