# Evarx Platform

> Engineering the biology of tomorrow.

A medical AI platform for pharma and healthcare. Build private agents, fine-tune CPU-runnable medical SLMs on your own data, and deploy in your own infrastructure — in hours, not months.

## Repository layout

```
evarx-platform/
├── apps/
│   ├── web/            Next.js 15 marketing site (deployed to evarx.in)
│   └── api/            FastAPI backend (deployed to Railway → AWS later)
├── content/            MDX content (placeholder)
├── infra/
│   ├── compose/        docker-compose for the web prod stack + API local dev
│   └── caddy/          Reverse proxy + TLS config
└── Makefile            Common commands
```

See [`apps/api/README.md`](apps/api/README.md) for backend setup and the Railway
deploy walkthrough.

## Local development

```bash
make install            # one-time: installs apps/web deps
make dev                # http://localhost:3000
```

## Production build (single-host)

```bash
make docker-up          # builds web image, starts web + Caddy
make docker-logs        # tail logs
```

The default `Caddyfile` is configured for `evarx.in` / `www.evarx.in` and will request TLS automatically when the DNS points to the host. For first-time local Docker testing, the Caddy `:80` block proxies through to the web container without TLS.

## Production deployment (Globehost shared cPanel)

The site is also published as a static export to `evarx.in` via GitHub Actions:
on every push to `main`, `.github/workflows/deploy.yml` runs `npm run build`
inside `apps/web` (with `output: "export"`) and FTP-uploads the resulting
`out/` folder into the cPanel `public_html/`. The Docker / Caddy stack above
is only used when self-hosting on a VPS.

## Pages

- `/` — Home (hero, pipeline, three engines, USP, use cases, compliance, CTA)
- `/platform` — Long-scroll explainer of the four-step pipeline
- `/custom-slm` — USP page: fine-tune lifecycle, CPU base models, continuous loop
- `/solutions` + `/solutions/{pharma-rd, clinical-ops, medical-affairs, regulatory, hospitals}`
- `/agents` — Filterable gallery of 12 medical agent templates
- `/pricing` — Three tiers + Enterprise + FAQ
- `/security` — Pillars, data flow, compliance map, deployment options
- `/resources` + `/resources/{slug}` — Whitepapers / articles
- `/company` — Mission, principles, team, careers, contact
- `/demo` — Multi-step lead capture form (persists to `apps/web/data/leads.json`)
- `/docs`, `/status`, `/login`, `/privacy`, `/terms`, `/dpa` — supporting pages

## Lead capture

The `/demo` form posts to FormSubmit (an external form-to-email service) so the
static export on Globehost can capture leads without a backend. The lead
schema lives in `apps/web/lib/lead-schema.ts`.

## Backend roadmap

The `apps/api/` skeleton is the start of the platform backend. Phased plan:

| Phase | Ships |
|---|---|
| **0 — Foundation** | FastAPI on Railway, Postgres + Redis, CORS, health probes, Org/User/Membership schema, Alembic migrations. |
| **1 — Real chat** | Supabase Auth (JWT verification), LiteLLM gateway, `/v1/chat/completions` SSE streaming Claude Haiku, audit log writer. |
| **2 — Data + RAG** | S3 upload (ap-south-1), chunking + embedding worker, pgvector retrieval, citations end-to-end. |
| **3 — Agents + Workflows** | Agent CRUD + invoke, linear workflow runner, `/console/agents` and `/console/workflows` real. |
| **4 — Medical SLM** | vLLM on AWS GPU serving a Llama-3-8B medical fine-tune, `evarx-medical` engine alias routes to it. |
| **5 — Billing + polish** | Stripe, usage metering, audit log UI, Sentry/Grafana hooked up. |

The console UI (`apps/web/app/console/`) currently uses mocked data. Once the
API is up, it will be split out to its own Vercel-hosted Next.js app at
`app.evarx.in` so we can use SSR + auth-gated routes properly.
