#!/bin/sh
set -eu

trim_trailing_slash() {
  printf '%s' "$1" | sed 's#/*$##'
}

export PORT="${PORT:-8080}"
export IDENTITY_UPSTREAM="$(trim_trailing_slash "${IDENTITY_UPSTREAM:-http://identity-service:6699}")"
export CONTENT_UPSTREAM="$(trim_trailing_slash "${CONTENT_UPSTREAM:-http://content-service:9966}")"
export AI_UPSTREAM="$(trim_trailing_slash "${AI_UPSTREAM:-http://ai-service:8989}")"

envsubst '${PORT} ${IDENTITY_UPSTREAM} ${CONTENT_UPSTREAM} ${AI_UPSTREAM}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
