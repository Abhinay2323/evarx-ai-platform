import type { Metadata } from "next";
import Link from "next/link";
import {
  Upload,
  ShieldCheck,
  Zap,
  Cpu,
  Repeat2,
  Server,
  ArrowRight,
  Check,
  PackageOpen,
  Boxes,
  WandSparkles,
  Workflow,
  ScanSearch,
  Activity
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { TCOCalculator } from "@/components/tco-calculator";
import { FineTuneSimulator } from "@/components/finetune-simulator";

export const metadata: Metadata = {
  title: "Custom SLM — fine-tune in hours",
  description:
    "Upload your data, get a CPU-runnable medical SLM trained on it in hours. Deploy in your VPC, on-prem, or air-gapped. No ML team required."
};

const lifecycle = [
  {
    icon: Upload,
    title: "Upload",
    body:
      "Drop in PDFs, EMR exports, structured tables, internal SOPs. We fingerprint and version everything.",
    eta: "Minutes"
  },
  {
    icon: ScanSearch,
    title: "Validate",
    body:
      "Automatic PHI detection and redaction. Schema validation. Quality scoring with reject reasons.",
    eta: "Minutes"
  },
  {
    icon: WandSparkles,
    title: "Fine-tune",
    body:
      "LoRA / QLoRA recipes pre-configured for medical SLM bases. Eval harness scores hallucination, faithfulness, and clinical accuracy.",
    eta: "≈ 4–6 hours"
  },
  {
    icon: Activity,
    title: "Evaluate",
    body:
      "Side-by-side outputs vs base model. Manual SME review queue. Automated regression on your golden test set.",
    eta: "30 minutes"
  },
  {
    icon: PackageOpen,
    title: "Package",
    body:
      "Quantised GGUF, ONNX, or vLLM-ready bundles. Includes model card, eval report, and deployment manifest.",
    eta: "Minutes"
  },
  {
    icon: Server,
    title: "Deploy",
    body:
      "Pull a Docker image into your VPC, on-prem, or hospital intranet. CPU is enough.",
    eta: "Same day"
  }
];

const bases = [
  { name: "Evarx-Med-1B", size: "1.1B params", cpu: "8 vCPU · 16 GB RAM", lat: "~120ms / token" },
  { name: "Evarx-Med-3B", size: "3.0B params", cpu: "16 vCPU · 32 GB RAM", lat: "~180ms / token" },
  { name: "Evarx-Med-7B", size: "7.2B params", cpu: "32 vCPU · 64 GB RAM", lat: "~280ms / token" }
];

export default function CustomSLMPage() {
  return (
    <>
      <PageHero
        eyebrow="Our USP · Custom SLM"
        title={
          <>
            Bring your data.{" "}
            <span className="bg-gradient-to-br from-helix-300 to-plasma-300 bg-clip-text text-transparent">
              Leave with a model.
            </span>
          </>
        }
        blurb="A medical SLM, fine-tuned on your proprietary data, packaged to run on the CPUs you already own. No GPU procurement. No vendor lock-in. No ML team required."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/demo" className="btn-primary">
            Start a fine-tune <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/security" className="btn-ghost">
            Read the security model
          </Link>
        </div>
      </PageHero>

      <section className="py-20 sm:py-28">
        <div className="container-px grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Why fine-tune?"
              title="RAG retrieves. Fine-tune internalises."
              body="Retrieval lets a generic model look up your data at inference time. Fine-tuning teaches your model the language, structure, and judgement of your domain — so every output is faster, cheaper, and grounded in how your team actually works."
            />
            <ul className="mt-8 space-y-3">
              {[
                "Lower latency — no retrieval round-trip for routine reasoning.",
                "Lower cost — smaller models replace expensive frontier API calls.",
                "Stronger privacy — model weights stay in your environment.",
                "Higher consistency — your tone, your formats, your terminology."
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-helix-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="card relative overflow-hidden p-6">
              <div className="absolute -inset-px -z-10 bg-gradient-to-br from-helix-500/15 via-transparent to-plasma-500/15" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                The lifecycle
              </p>
              <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                {lifecycle.map((s, i) => (
                  <li
                    key={s.title}
                    className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink-900/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-helix-400 to-plasma-500 text-ink-950">
                        <s.icon className="h-4 w-4" />
                      </span>
                      <span className="font-mono text-[11px] text-helix-300">
                        0{i + 1} · {s.eta}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    <p className="text-xs leading-relaxed text-zinc-400">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-px">
          <SectionHeading
            eyebrow="Base models"
            title="Pick your size. They all run on CPU."
            body="Three sizes of the Evarx Medical SLM serve as the base for your fine-tune. Quantised builds (Q4_K_M, Q5_K_M) ship for every size — even the 7B fits on a workstation."
          />

          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-zinc-300">
                <tr>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Recommended CPU</th>
                  <th className="px-5 py-3 font-medium">Latency (Q4_K_M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {bases.map((b) => (
                  <tr key={b.name}>
                    <td className="px-5 py-3 font-medium text-white">{b.name}</td>
                    <td className="px-5 py-3">{b.size}</td>
                    <td className="px-5 py-3">{b.cpu}</td>
                    <td className="px-5 py-3 font-mono text-helix-300">{b.lat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FineTuneSimulator />

      <TCOCalculator />

      <section className="py-20 sm:py-28">
        <div className="container-px grid gap-10 lg:grid-cols-2">
          <div className="card p-8">
            <Repeat2 className="h-6 w-6 text-helix-300" />
            <h3 className="mt-5 font-display text-xl font-semibold text-white">
              Continuous improvement loop
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Every workflow run that gets a thumbs-up — or an SME-edited correction — becomes a
              labelled training pair. Schedule nightly refresh runs and your model improves while
              you sleep. Roll back any version with one click.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
              {[
                "Versioned weights with git-style diffing",
                "Eval gates prevent regressions from shipping",
                "Per-team feedback isolation"
              ].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-helix-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-8">
            <Cpu className="h-6 w-6 text-helix-300" />
            <h3 className="mt-5 font-display text-xl font-semibold text-white">
              Why CPU-runnable matters
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Hospitals, regulated pharma units, and air-gapped research sites can&apos;t always
              procure GPUs. Quantised SLMs let you ship the same model your data scientists trained
              into a 16-core production server — no infrastructure rewrite.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
              {[
                "Runs on existing hospital-grade hardware",
                "Air-gap deployable via signed Docker images",
                "Cost per token approaches zero at steady state"
              ].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-helix-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="container-px">
          <div className="card relative overflow-hidden p-10 sm:p-14">
            <div className="absolute inset-0 -z-10 bg-helix-glow" />
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <span className="eyebrow">
                  <Zap className="h-3.5 w-3.5" /> Get started
                </span>
                <h2 className="heading-section mt-5">
                  A fine-tune scoped, signed off, and running this week.
                </h2>
                <p className="lede mt-4">
                  Tell us your highest-leverage workflow. We&apos;ll respond with a data spec, a
                  fixed-price scope, and a deployment plan within a business day.
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-helix-400" /> NDA & DPA on request
                    </li>
                    <li className="flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-helix-400" /> Fixed-price first fine-tune
                    </li>
                    <li className="flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-helix-400" /> Includes one production agent
                    </li>
                  </ul>
                  <Link href="/demo" className="btn-primary mt-5 w-full justify-center">
                    Book a demo <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
