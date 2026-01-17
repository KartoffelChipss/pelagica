#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_PATH="$SCRIPT_DIR/dev.config.json"

# start vite dev server
(
  cd "$SCRIPT_DIR/frontend"
  pnpm run dev -- --host
) &

# start go backend
(
  cd "$SCRIPT_DIR/backend"
  CONFIG_PATH="$CONFIG_PATH" go run main.go
) &

wait