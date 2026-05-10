#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Starting n8n Docker container..."
docker start n8n-fresh >/dev/null 2>&1 || true

echo "Starting Ollama..."
brew services start ollama >/dev/null 2>&1 || true

echo "Starting MoAI at http://localhost:3000"
npm start
