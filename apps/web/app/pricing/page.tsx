import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { EngineQuiz } from "@/components/engine-quiz";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Three tiers mapped to Evarx's three intelligence engines, plus Enterprise for custom fine-tuned SLMs and on-prem deployment. Pricing is in INR with USD on request."
};

const tiers = [
  {
    name: "Standard",
    badge: "Hosted AI",
    blurb: "For teams prototyping medical workflows on a hosted general-purpose model.",
    price: "₹49,000",
    cadence: "/ month",
    note: "Includes 5M tokens. Pay-as-you-go beyond.",
    features: [
      "Evarx Standard LLM",
      "5 workflows + 3 seats included",
      "Hosted in India · in-region",
      "Email support",
      "API + dashboard"
    ],
    cta: { href: "/demo", label: "Start with Standard" },
    highlight: false
  },
  {
    name: "Private",
    badge: "Medical SLM",
    blurb: "For teams that need data residency and the Evarx Medical SLM in their VPC.",
    price: "₹2,49,000",
    cadence: "/ month",
    note: "Includes deployment to your VPC + 25M tokens.",
    features: [
      "Evarx Medical SLM in your VPC",
      "Unlimited workflows · 10 seats",
      "DPDP Act + HIPAA-aligned",
      "Priority support · 4hr SLA",
      "SSO + RBAC + audit logs"
    ],
    cta: { href: "/demo", label: "Talk to sales" },
    highlight: true
  },
  {
    name: "Custom",
    badge: "Fine-tuned SLM",
    blurb: "For teams that want a CPU-runnable SLM trained on their proprietary data.",
    price: "Custom",
    cadence: "",
    note: "Fixed-price first fine-tune. Volume thereafter.",
    features: [
      "Custom fine-tune (≤6 hrs)",
      "On-prem · VPC · air-gapped deploy",
      "Continuous improvement loop",
      "Dedicated solutions architect",
      "Quarterly model refresh included"
    ],
    cta: { href: "/demo", label: "Scope a fine-tune" },
    highlight: false
  }
];

const enterprise = [
  "Multi-region deployments",
  "Dedicated single-tenant infra",
  "BAA / DPA / NDA available",
  "Custom SLAs and uptime guarantees",
  "Roadmap influence",
  "Source code escrow option"
];

const faq = [
  {
    q: "Are prices in INR?",
    a: "Yes — pricing is in INR for India-based customers. USD pricing is available on request for international teams."
  },
  {
    q: "Do you charge per token, per seat, or both?",
    a: "Plans are seat + workflow based with a generous token allocation. Overage is billed transparently per million tokens. Custom-tier customers running on their own hardware pay no token fees."
  },
  {
    q: "What's the minimum commitment?",
    a: "Standard and Private are billed monthly with no annual lock-in. Custom typically runs annual to amortise fine-tune work."
  },
  {
    q: "Do you offer pilots?",
    a: "Yes — every Custom engagement starts with a fixed-price pilot fine-tune so you can validate quality before committing."
  }
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Pick the engine that matches your privacy posture."
        blurb="Move up the stack as your sensitivity grows. Workflows are portable across tiers — your work doesn't get rebuilt when you upgrade."
      />

      <section className="py-12">
        <div className="container-px grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className="relative flex">
              {t.highlight && (
                <span className="absolute -top-3 left-6 z-20 inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-helix-400/40 bg-ink-900/95 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-helix-200 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] backdrop-blur">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}
              <div
                className={cn(
                  "card flex w-full flex-col",
                  t.highlight && "shadow-glow ring-1 ring-helix-400/30"
                )}
              >
                <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  {t.badge}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                  {t.name}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{t.blurb}</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-white">
                  {t.price}
                </span>
                <span className="text-sm text-zinc-500">{t.cadence}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{t.note}</p>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-helix-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex-1" />
              <Link
                href={t.cta.href}
                className={cn(
                  "mt-8 justify-center",
                  t.highlight ? "btn-primary" : "btn-ghost"
                )}
              >
                {t.cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container-px">
          <div className="card flex flex-col gap-6 p-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <p className="font-mono text-[11px] uppercase tracking-wider text-helix-300">
                Enterprise
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">
                Air-gapped, regulated, multi-region.
              </h3>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                For pharma majors and hospital systems with strict residency, contractual, and
                operational requirements. Fully white-glove from procurement to renewal.
              </p>
            </div>
            <ul className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              {enterprise.map((e) => (
                <li key={e} className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-helix-400" />
                  {e}
                </li>
              ))}
            </ul>
            <Link href="/demo" className="btn-primary shrink-0">
              Talk to sales <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-px max-w-3xl text-center">
          <span className="eyebrow">Not sure which to pick?</span>
          <h2 className="heading-section mt-5">A 30-second diagnostic.</h2>
          <p className="lede mx-auto mt-4">
            Four questions to recommend the right engine for your team&apos;s sensitivity,
            deployment, and volume.
          </p>
        </div>
        <EngineQuiz />
      </section>

      <section className="py-16">
        <div className="container-px max-w-3xl">
          <h2 className="heading-section">Frequently asked.</h2>
          <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {faq.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-base font-medium text-white">{f.q}</dt>
                <dd className="mt-2 text-sm text-zinc-400">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
