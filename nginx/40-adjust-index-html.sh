#!/usr/bin/env sh
set -euo pipefail

if test -z "${CONFIG_JSON:-}"
then
  echo "cannot start: CONFIG_JSON should be set to a valid configuration file"
  exit 1
fi

rm -rf /tmp/new_index
mkdir -p /tmp/new_index
echo "<script>window.__ENV = JSON.parse(atob('`base64 -w 0 "$CONFIG_JSON"`'));</script>" > /tmp/new_index/config.js
sed -e '/<!-- INJECT_CONFIG -->/r /tmp/new_index/config.js' /usr/share/nginx/html/index.html > /tmp/new_index/index.html
rm /tmp/new_index/config.js
