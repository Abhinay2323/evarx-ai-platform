# Evarx Platform

> Engineering the biology of tomorrow.

A medical AI platform for pharma and healthcare. Build private agents, fine-tune CPU-runnable medical SLMs on your own data, and deploy in your own infrastructure — in hours, not months.

## Repository layout

```
evarx-platform/
├── apps/
│   └── web/            Next.js 15 marketing site (this is what's built so far)
├── content/            MDX content (placeholder for Phase 2)
├── infra/
│   ├── compose/        docker-compose for prod single-node + dev
│   └── caddy/          Reverse proxy + TLS config
└── Makefile            Common commands
```

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

## Lead storage

The `/demo` form posts to `app/api/leads/route.ts`, which appends validated leads to `apps/web/data/leads.json` inside the container (mounted to a Docker volume in production). Replace this with a Postgres adapter when the backend lands.

## What's next (Phase 2)

- FastAPI backend for streaming chat against the real Medical SLM
- Postgres + Qdrant for lead storage and RAG
- LiteLLM gateway for engine routing
- Cal.com integration for scheduling
- MDX-driven blog system (currently flat data file in `lib/posts.ts`)
