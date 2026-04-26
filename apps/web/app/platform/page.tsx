import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain,
  Database,
  Workflow,
  Rocket,
  Cloud,
  Lock,
  Sparkles,
  Check,
  ArrowRight,
  FileText,
  FlaskConical,
  Hospital,
  Cloud as CloudIcon,
  ShieldCheck,
  Cpu,
  Server,
  Network
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Evarx is one platform with three intelligence engines, a medical-grade data layer, a visual workflow builder, and one-click private deployment."
};

const engines = [
  {
    id: "engines-standard",
    badge: "Standard",
    icon: Cloud,
    name: "Evarx Standard LLM",
    body: "Hosted proprietary general-purpose LLM. Ideal for prototyping, low-sensitivity workloads, and high-volume tasks.",
    bullets: ["Hosted by Evarx · in-region", "Pay-per-token", "Available across India region", "Quickest path to first agent"]
  },
  {
    id: "engines-private",
    badge: "Private",
    icon: Lock,
    name: "Evarx Medical SLM",
    body: "A small language model pre-trained on biomedical and clinical corpora. Deployed in your VPC or on-prem.",
    bullets: [
      "Pre-trained on medical corpora",
      "On-prem or VPC",
      "Zero data egress",
      "DPDP Act + HIPAA-aligned"
    ]
  },
  {
    id: "engines-custom",
    badge: "Custom · USP",
    icon: Sparkles,
    name: "Rapid Fine-Tuned SLM",
    body: "Upload your data, get a CPU-runnable model trained on it in hours. No ML team required.",
    bullets: [
      "<6 hour fine-tune cycle",
      "CPU-runnable, quantised",
      "Air-gapped deploy",
      "Continuously refined"
    ]
  }
];

const connectors = [
  { name: "Epic & Cerner EMR", group: "Clinical" },
  { name: "PubMed / MEDLINE", group: "Literature" },
  { name: "ClinicalTrials.gov", group: "Trials" },
  { name: "OpenFDA / CDSCO", group: "Regulatory" },
  { name: "SharePoint", group: "Documents" },
  { name: "Confluence", group: "Documents" },
  { name: "S3 / Azure Blob", group: "Storage" },
  { name: "Postgres / MSSQL", group: "Databases" },
  { name: "Snowflake / BigQuery", group: "Warehouse" },
  { name: "Veeva Vault", group: "Life sciences" },
  { name: "Salesforce Health Cloud", group: "CRM" },
  { name: "REST / GraphQL APIs", group: "Custom" }
];

const workflowTemplates = [
  { icon: FlaskConical, name: "Clinical trial protocol summarizer" },
  { icon: FileText, name: "ICSR triage & MedDRA coding" },
  { icon: Hospital, name: "Pre-visit EHR summarization" },
  { icon: ShieldCheck, name: "Promotional content compliance review" },
  { icon: Brain, name: "Medical literature daily digest" },
  { icon: Workflow, name: "Multi-step regulatory submission drafter" }
];

const deployModes = [
  {
    icon: CloudIcon,
    name: "Managed SaaS",
    body: "Hosted by Evarx in AWS Mumbai. Fastest start, single-tenant database.",
    chip: "Most popular"
  },
  {
    icon: Server,
    name: "Customer VPC",
    body: "Deployed via Terraform into your AWS, Azure, or GCP account. Zero egress.",
    chip: "Enterprise"
  },
  {
    icon: Cpu,
    name: "On-prem · CPU",
    body: "Docker images for air-gapped hospital networks. Quantised SLMs run on existing servers.",
    chip: "Healthcare"
  }
];

export default function PlatformPage() {
  return (
    <>
      <PageHero
        eyebrow="The platform"
        title={
          <>
            One platform from{" "}
            <span className="bg-gradient-to-br from-helix-300 to-plasma-300 bg-clip-text text-transparent">
              raw clinical data
            </span>{" "}
            to a deployed medical agent.
          </>
        }
        blurb="Evarx is composed of four interlocking layers. Each is independently swappable, so you can start hosted and graduate to a fully private fine-tuned SLM without rewriting a workflow."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/demo" className="btn-primary">
            Book a demo <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#engines" className="btn-ghost">
            Jump to engines
          </Link>
        </div>
      </PageHero>

      <section className="py-12">
        <div className="container-px">
          <ol className="grid gap-3 md:grid-cols-4">
            {[
              { icon: Brain, label: "Intelligence engines" },
              { icon: Database, label: "Data layer & RAG" },
              { icon: Workflow, label: "Workflow builder" },
              { icon: Rocket, label: "Deploy & scale" }
            ].map((s, i) => (
              <li
                key={s.label}
                className="card flex items-center gap-3 px-4 py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-helix-500/10 text-helix-300">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-zinc-200">
                  <span className="font-mono text-xs text-zinc-500">0{i + 1}</span> · {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="engines" className="py-20 sm:py-28">
        <div className="container-px">
          <SectionHeading
            eyebrow="01 · Intelligence"
            title="Three engines, one orchestrator."
            body="Workflows reference an engine by alias. Swap underlying models — Evarx Standard, Evarx Medical SLM, or your fine-tune — without changing a single line of agent code."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {engines.map((e) => (
              <article key={e.id} id={e.id} className="card flex flex-col">
                <header className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-300">
                    {e.badge}
                  </span>
                  <e.icon className="h-5 w-5 text-zinc-400" />
                </header>
                <h3 className="mt-6 font-display text-xl font-semibold text-white">
                  {e.name}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{e.body}</p>
                <ul className="mt-5 space-y-2">
                  {e.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="h-4 w-4 text-helix-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-zinc-300">
                <tr>
                  <th className="px-5 py-3 font-medium">Capability</th>
                  <th className="px-5 py-3 font-medium">Standard</th>
                  <th className="px-5 py-3 font-medium">Private</th>
                  <th className="px-5 py-3 font-medium text-helix-300">Custom (USP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {[
                  ["Data residency", "Evarx · in-region", "Your VPC / on-prem", "Your VPC / on-prem"],
                  ["Domain knowledge", "General", "Medical baseline", "Your proprietary data"],
                  ["Hardware", "Hosted", "GPU / CPU", "CPU"],
                  ["Time to deploy", "Minutes", "Hours", "Hours (post fine-tune)"],
                  ["Continuous improvement", "—", "Optional", "Built-in"],
                  ["Air-gapped support", "—", "Yes", "Yes"]
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className={`px-5 py-3 ${j === 3 ? "text-helix-200" : ""}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="data" className="py-20 sm:py-28">
        <div className="container-px">
          <SectionHeading
            eyebrow="02 · Data layer"
            title="Your data, retrieved and refined."
            body="Connectors feed structured and unstructured medical data into a hybrid retrieval index. The same data also generates training pairs to refine your private SLM over time."
          />

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="card p-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Connectors · 30+
                </p>
                <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {connectors.map((c) => (
                    <li
                      key={c.name}
                      className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
                    >
                      <span className="text-sm text-white">{c.name}</span>
                      <span className="text-[11px] text-zinc-500">{c.group}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="card h-full p-6">
                <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Pipeline
                </p>
                <ol className="mt-5 space-y-4 text-sm text-zinc-300">
                  {[
                    { t: "Ingest", b: "Streaming + batch, with PHI redaction at the edge." },
                    { t: "Chunk + embed", b: "Medical-aware chunking. BGE-M3 multilingual embeddings." },
                    { t: "Index", b: "Hybrid (vector + lexical) over Qdrant + Postgres." },
                    { t: "Retrieve", b: "Re-ranking with grounded citations on every span." },
                    { t: "Refine", b: "Validated outputs become supervised pairs for the next fine-tune." }
                  ].map((s, i) => (
                    <li key={s.t} className="flex gap-4">
                      <span className="font-mono text-xs text-helix-300">0{i + 1}</span>
                      <div>
                        <p className="font-medium text-white">{s.t}</p>
                        <p className="text-zinc-400">{s.b}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflows" className="py-20 sm:py-28">
        <div className="container-px">
          <SectionHeading
            eyebrow="03 · Workflows"
            title="Drag, drop, ship."
            body="Build agents visually or start from medical templates. Every node is observable, versioned, and runs against any of your engines."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workflowTemplates.map((t) => (
              <div key={t.name} className="card flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-plasma-500/10 text-plasma-300">
                  <t.icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-white">{t.name}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-zinc-400">
            Plus six more in the{" "}
            <Link href="/agents" className="text-helix-300 link-underline">
              agents gallery
            </Link>
            . All templates are forkable.
          </p>
        </div>
      </section>

      <section id="deploy" className="py-20 sm:py-28">
        <div className="container-px">
          <SectionHeading
            eyebrow="04 · Deploy & scale"
            title="One workflow. Three deployment shapes."
            body="Choose where each workflow runs. Switch shapes per environment without rewriting agent logic."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {deployModes.map((d) => (
              <div key={d.name} className="card flex flex-col">
                <header className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-helix-300">
                    <d.icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wider text-zinc-300">
                    {d.chip}
                  </span>
                </header>
                <h3 className="mt-6 font-display text-xl font-semibold text-white">
                  {d.name}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{d.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              { icon: Network, k: "API + SDK", v: "OpenAI-compatible endpoints, TS + Python SDKs." },
              { icon: ShieldCheck, k: "Audit & RBAC", v: "Per-tenant logs, fine-grained roles, SSO." },
              { icon: Sparkles, k: "Usage billing", v: "Per-call metering, budget caps, finance-ready exports." }
            ].map((b) => (
              <div key={b.k} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <b.icon className="h-5 w-5 text-helix-300" />
                <p className="mt-3 text-sm font-semibold text-white">{b.k}</p>
                <p className="mt-1 text-sm text-zinc-400">{b.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
