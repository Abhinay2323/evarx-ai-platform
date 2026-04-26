import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Server,
  FileLock2,
  Fingerprint,
  EyeOff,
  Workflow,
  ArrowRight,
  Globe2,
  History,
  ShieldAlert
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Security & compliance",
  description:
    "Evarx is engineered for regulated medical workloads. DPDP Act 2023 ready, HIPAA-aligned, ISO 27001 in progress. Deployment options span SaaS, customer VPC, on-prem, and air-gapped."
};

const pillars = [
  {
    icon: ShieldCheck,
    title: "Data residency",
    body: "All Indian customers run in AWS Mumbai by default. VPC and on-prem options keep data fully under your control."
  },
  {
    icon: Lock,
    title: "Encryption everywhere",
    body: "TLS 1.3 in transit. AES-256 at rest with envelope encryption. Customer-managed keys (BYOK) supported."
  },
  {
    icon: EyeOff,
    title: "PHI redaction",
    body: "Automatic PHI detection at ingestion. Redacted variants used for retrieval; originals stay in your tenant."
  },
  {
    icon: KeyRound,
    title: "Identity & access",
    body: "SSO via SAML / OIDC. Fine-grained RBAC down to workflow nodes. Time-bound break-glass access."
  },
  {
    icon: Fingerprint,
    title: "Auditability",
    body: "Every prompt, citation, and model output is logged with user, timestamp, and source span."
  },
  {
    icon: ShieldAlert,
    title: "Threat & abuse",
    body: "Prompt injection defenses, rate limiting, anomaly detection on agent outputs."
  }
];

const deployments = [
  { name: "Managed SaaS", note: "AWS Mumbai · single-tenant DB" },
  { name: "Customer VPC", note: "Terraform-deployed into your AWS / Azure / GCP" },
  { name: "On-prem · CPU", note: "Air-gappable Docker images for hospital networks" },
  { name: "Hybrid", note: "Control plane SaaS + data plane in your perimeter" }
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Security & compliance"
        title="Engineered for regulated medical work."
        blurb="Compliance is not a checkbox — it's the substrate. Below is how Evarx handles your data, who can see what, and how you stay in control end to end."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/demo" className="btn-primary">
            Request our security pack <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#trust" className="btn-ghost">
            Trust posture
          </Link>
        </div>
      </PageHero>

      <section id="trust" className="py-20 sm:py-28">
        <div className="container-px">
          <SectionHeading eyebrow="Pillars" title="Six controls, applied everywhere." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="card">
                <p.icon className="h-6 w-6 text-helix-300" />
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-px">
          <div className="card p-8">
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              Data flow
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold text-white">
              How a request flows — and what never moves.
            </h3>
            <ol className="mt-6 grid gap-3 md:grid-cols-5">
              {[
                { icon: Workflow, t: "Request", b: "User prompt + workflow context" },
                { icon: EyeOff, t: "Redact", b: "PHI removed at the gateway" },
                { icon: Server, t: "Retrieve", b: "Hybrid index in your tenant" },
                { icon: Lock, t: "Generate", b: "Engine you chose · in-region" },
                { icon: History, t: "Log", b: "Trace + citations stored" }
              ].map((s, i) => (
                <li
                  key={s.t}
                  className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink-900/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <s.icon className="h-5 w-5 text-helix-300" />
                    <span className="font-mono text-[11px] text-zinc-500">0{i + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{s.t}</p>
                  <p className="text-xs text-zinc-400">{s.b}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs text-zinc-500">
              No customer data is used to train shared base models. Ever. Custom fine-tunes use only
              your data, and the resulting weights are yours.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-px grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Compliance"
              title="The standards we map to."
              body="We treat compliance as a continuously verified posture, not a poster on the wall."
            />
            <ul className="mt-8 space-y-3 text-sm text-zinc-300">
              {[
                "DPDP Act 2023 — India data residency by default.",
                "HIPAA-aligned controls (BAA available).",
                "ISO 27001 — certification in progress (target: Q4 FY26).",
                "SOC 2 Type II — under preparation.",
                "Annual third-party penetration tests.",
                "Documented incident response with 24-hour disclosure SLA."
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-helix-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="card p-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                Deployment options
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {deployments.map((d) => (
                  <li
                    key={d.name}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-helix-300" />
                      <p className="text-sm font-semibold text-white">{d.name}</p>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{d.note}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl border border-helix-400/20 bg-helix-500/[0.06] p-4">
                <p className="text-sm font-medium text-helix-200">
                  Need a security questionnaire response?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-helix-100/80">
                  We respond to CAIQ, SIG, and HECVAT questionnaires within 5 business days.
                </p>
                <Link
                  href="/demo"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-helix-200 link-underline"
                >
                  Request the response pack <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px">
          <div className="card p-8">
            <FileLock2 className="h-6 w-6 text-helix-300" />
            <h3 className="mt-5 font-display text-xl font-semibold text-white">
              Legal artifacts on request
            </h3>
            <ul className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-3">
              <li>· Data Processing Agreement (DPA)</li>
              <li>· Business Associate Agreement (BAA)</li>
              <li>· Mutual NDA</li>
              <li>· Sub-processor list</li>
              <li>· Incident response policy</li>
              <li>· Vulnerability disclosure policy</li>
            </ul>
            <Link
              href="/demo"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-helix-300 link-underline"
            >
              Request artifacts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
