#!/usr/bin/env bash
# Pull the latest code and rebuild the production stack.
# Usage:
#   sudo /opt/evarx/infra/aws/deploy.sh           # rebuild everything
#   sudo /opt/evarx/infra/aws/deploy.sh api       # rebuild just the api
#   sudo /opt/evarx/infra/aws/deploy.sh litellm   # rebuild just litellm

set -euo pipefail

REPO_DIR="${EVARX_REPO_DIR:-/opt/evarx}"
COMPOSE_FILE="docker-compose.prod.yml"

cd "$REPO_DIR"

echo "==> git pull"
git pull --ff-only

cd "$REPO_DIR/infra/compose"

if [ ! -f .env ]; then
  echo "ERROR: $REPO_DIR/infra/compose/.env is missing." >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "==> docker compose up -d --build (all services)"
  docker compose -f "$COMPOSE_FILE" --env-file .env up -d --build
else
  echo "==> docker compose up -d --build $*"
  docker compose -f "$COMPOSE_FILE" --env-file .env up -d --build "$@"
fi

echo
echo "==> docker compose ps"
docker compose -f "$COMPOSE_FILE" --env-file .env ps

echo
echo "Done. Tail logs with:"
echo "  sudo docker compose -f $REPO_DIR/infra/compose/$COMPOSE_FILE --env-file $REPO_DIR/infra/compose/.env logs -f api"
