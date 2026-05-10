#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Stopping MoAI server on port 3000..."
PID="$(lsof -tiTCP:3000 -sTCP:LISTEN || true)"
if [ -n "$PID" ]; then
  kill "$PID" || true
fi

echo "Stopping n8n Docker container..."
docker stop n8n-fresh >/dev/null 2>&1 || true

echo "Stopping Ollama..."
brew services stop ollama >/dev/null 2>&1 || true

echo "Done."
