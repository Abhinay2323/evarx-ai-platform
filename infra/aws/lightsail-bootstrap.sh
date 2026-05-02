#!/usr/bin/env bash
# lightsail-bootstrap.sh — paste-once setup for a fresh Ubuntu 22.04+ Lightsail box.
#
# What it does:
#   1. Installs Docker + Compose plugin
#   2. Clones the evarx repo into /opt/evarx
#   3. Drops a placeholder .env you fill in
#   4. Builds and brings up the stack
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Abhinay2323/evarx-ai-platform/main/infra/aws/lightsail-bootstrap.sh | sudo bash
#   # or copy-paste the file onto the box and: sudo bash lightsail-bootstrap.sh
#
# After it finishes:
#   sudo nano /opt/evarx/infra/compose/.env   # fill in secrets
#   cd /opt/evarx/infra/compose
#   sudo docker compose -f docker-compose.prod.yml --env-file .env up -d --build

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Abhinay2323/evarx-ai-platform.git}"
INSTALL_DIR="${INSTALL_DIR:-/opt/evarx}"

echo ">> Updating apt"
apt-get update -y
apt-get upgrade -y

echo ">> Installing prerequisites"
apt-get install -y \
    ca-certificates \
    curl \
    git \
    gnupg \
    ufw

echo ">> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
      https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      > /etc/apt/sources.list.d/docker.list

    apt-get update -y
    apt-get install -y \
        docker-ce \
        docker-ce-cli \
        containerd.io \
        docker-buildx-plugin \
        docker-compose-plugin
fi

systemctl enable --now docker

echo ">> Configuring firewall (UFW)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ">> Cloning repo into ${INSTALL_DIR}"
if [ ! -d "${INSTALL_DIR}" ]; then
    git clone "${REPO_URL}" "${INSTALL_DIR}"
else
    git -C "${INSTALL_DIR}" pull --ff-only
fi

cd "${INSTALL_DIR}/infra/compose"

if [ ! -f .env ]; then
    echo ">> Creating .env from template — YOU MUST EDIT THIS BEFORE BRINGING UP THE STACK"
    cp .env.production.example .env
    chmod 600 .env
fi

echo ""
echo "================================================================"
echo "Bootstrap complete."
echo ""
echo "Next steps:"
echo "  1. Edit secrets:"
echo "       sudo nano ${INSTALL_DIR}/infra/compose/.env"
echo "     Required: POSTGRES_PASSWORD, LITELLM_MASTER_KEY, GEMINI_API_KEY"
echo ""
echo "  2. Point DNS:"
echo "     Add an A record for api.evarx.in -> $(curl -fsS https://api.ipify.org || echo '<this box public IP>')"
echo ""
echo "  3. Bring up the stack:"
echo "       cd ${INSTALL_DIR}/infra/compose"
echo "       sudo docker compose -f docker-compose.prod.yml --env-file .env up -d --build"
echo ""
echo "  4. Watch logs:"
echo "       sudo docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "  5. Smoke test (after DNS propagates):"
echo "       curl -i https://api.evarx.in/health"
echo "================================================================"
