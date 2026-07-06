#!/usr/bin/env sh
set -eu

cd /app

hash_file="/app/node_modules/.utekos-pnpm-lock.sha256"
current_hash="$(sha256sum package.json pnpm-lock.yaml | sha256sum | awk '{ print $1 }')"
stored_hash=""

if [ -f "$hash_file" ]; then
  stored_hash="$(cat "$hash_file")"
fi

if [ ! -x /app/node_modules/.bin/next ] || [ "$stored_hash" != "$current_hash" ]; then
  pnpm install --frozen-lockfile
  printf '%s\n' "$current_hash" > "$hash_file"
fi

exec "$@"
