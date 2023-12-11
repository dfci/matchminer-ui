#!/usr/bin/env sh
set -euo pipefail

echo "
upstream api {
    server ${API_URL:-matchminer-api} max_fails=0;
    keepalive 64;
}
" > /tmp/upstream.conf;
