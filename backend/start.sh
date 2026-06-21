#!/bin/sh
set -eu

export IDENTITY_URL="http://127.0.0.1:6699"
export CONTENT_URL="http://127.0.0.1:9966"
export AI_URL="http://127.0.0.1:8989"

cd /app/identity
./identity-service &
IDENTITY_PID=$!

cd /app/content
./content-service &
CONTENT_PID=$!

cd /app/ai
PYTHONPATH=/app/ai/src python -m main &
AI_PID=$!

cd /app/gateway
./gateway &
GATEWAY_PID=$!

shutdown() {
  kill "$GATEWAY_PID" "$AI_PID" "$CONTENT_PID" "$IDENTITY_PID" 2>/dev/null || true
  wait
}
trap shutdown INT TERM

wait "$GATEWAY_PID"
