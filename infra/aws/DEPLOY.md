# Deploy: Evarx control plane on AWS Lightsail (Mumbai)

Single-VM production for Phase 1.0. Costs ~$10/mo (covered by AWS credits).
Hosts: FastAPI + Postgres (pgvector) + Redis + LiteLLM + Caddy.

---

## 1. Create the Lightsail instance

1. Go to <https://lightsail.aws.amazon.com>.
2. **Create instance** → **Linux/Unix** → **OS Only: Ubuntu 22.04 LTS**.
3. **Region**: **Mumbai (ap-south-1a)**.
4. **Plan**: **$10/mo (2GB RAM, 1 vCPU, 60GB SSD, 3TB transfer)**.
5. **Identify your instance**: `evarx-prod-1`.
6. Click **Create instance**. Wait ~60s for it to be `Running`.

## 2. Static IP + firewall

1. **Networking** tab → **Create static IP** → attach to `evarx-prod-1`.
   You now have a permanent public IP. Note it down — we'll point DNS at it.
2. Instance → **Networking** tab → **IPv4 Firewall**:
   - Allow `SSH / TCP / 22` (default)
   - Allow `HTTP / TCP / 80`
   - Allow `HTTPS / TCP / 443`
   Remove anything else.

## 3. Point `api.evarx.in` at the static IP

In Globehost cPanel → **Zone Editor** → `evarx.in`:
- Add **A record**:
  - Name: `api`
  - Address: `<your Lightsail static IP>`
  - TTL: `14400` (default is fine)

DNS usually propagates in 5–30 min. You can check with:
```bash
dig +short api.evarx.in
```

## 4. SSH into the box and run bootstrap

From Lightsail console → instance → **Connect using SSH** (browser SSH works fine).

```bash
curl -fsSL https://raw.githubusercontent.com/Abhinay2323/evarx-ai-platform/main/infra/aws/lightsail-bootstrap.sh | sudo bash
```

This installs Docker, clones the repo to `/opt/evarx`, sets up the firewall, and creates a placeholder `.env`. Takes ~3 minutes.

## 5. Fill in production secrets

```bash
sudo nano /opt/evarx/infra/compose/.env
```

Set the four values:
- `POSTGRES_PASSWORD` — generate with `openssl rand -base64 32`
- `LITELLM_MASTER_KEY` — generate with `openssl rand -hex 32`
- `GEMINI_API_KEY` — paste from <https://aistudio.google.com/app/apikey>
- `API_DOMAIN` — should already be `api.evarx.in`; double-check

Save (`Ctrl+O`, `Enter`, `Ctrl+X`).

## 6. Bring up the stack

```bash
cd /opt/evarx/infra/compose
sudo docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

First build takes 5–10 min (pulls images, builds API). Watch progress:
```bash
sudo docker compose -f docker-compose.prod.yml logs -f
```

Caddy will request a Let's Encrypt cert for `api.evarx.in` automatically — this only works once your DNS A record has propagated, so run `dig +short api.evarx.in` first and confirm it returns your static IP.

## 7. Smoke test

From your laptop:
```bash
curl -i https://api.evarx.in/health
# expected: HTTP/2 200, body {"status":"ok",...}

curl -i -N -X POST https://api.evarx.in/v1/public/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello, briefly."}'
# expected: text/event-stream, streamed tokens
```

## 8. Wire the frontend

In GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Variables tab** → add:
- Name: `NEXT_PUBLIC_API_URL`
- Value: `https://api.evarx.in`

Trigger a frontend deploy (push any small change, or re-run the latest `deploy` workflow). The "Try the demo" on `evarx.in` will start streaming from the real API.

---

## Day-2 ops cheatsheet

```bash
# Pull latest code + rebuild
cd /opt/evarx
sudo git pull
cd infra/compose
sudo docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Tail logs
sudo docker compose -f docker-compose.prod.yml logs -f api
sudo docker compose -f docker-compose.prod.yml logs -f caddy

# Restart one service
sudo docker compose -f docker-compose.prod.yml restart api

# Postgres shell
sudo docker exec -it evarx-postgres psql -U evarx -d evarx

# Backup Postgres (run nightly via cron)
sudo docker exec evarx-postgres pg_dump -U evarx evarx | gzip > /opt/evarx-backup-$(date +%F).sql.gz
```

## Lightsail snapshots

In Lightsail console → instance → **Snapshots** → enable **Automatic snapshots**, daily at 02:00 IST. ~$0.50/mo for 7 days of retention. Restores the entire box if something goes wrong.
