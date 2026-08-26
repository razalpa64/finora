#!/usr/bin/env sh
set -eu
if ! command -v java >/dev/null 2>&1; then echo "Java 21+ is required." >&2; exit 1; fi
major=$(java -version 2>&1 | awk -F '[".]' '/version/ {print $2; exit}')
if [ "${major:-0}" -lt 21 ]; then echo "Java 21+ is required; found Java ${major:-unknown}." >&2; exit 1; fi
exec mvn javafx:run
