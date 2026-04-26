"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, ShieldCheck, Zap, Repeat2 } from "lucide-react";

const flow = [
  { label: "Upload data", sub: "PDFs, EMRs, datasets" },
  { label: "Validate", sub: "PHI redaction, schema check" },
  { label: "Fine-tune", sub: "GPU cluster, eval harness" },
  { label: "Deploy", sub: "CPU on-prem or VPC" }
];

export function USP() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-helix-glow" />
      <div className="container-px">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <span className="eyebrow">
              <Zap className="h-3.5 w-3.5" /> Our USP
            </span>
            <h2 className="heading-section mt-5">
              A medical SLM, fine-tuned on your data,{" "}
              <span className="text-shimmer">running on your CPUs.</span>
            </h2>
            <p className="lede mt-6">
              Most platforms stop at retrieval. Evarx goes further — every interaction can refine
              a model you actually own. No vendor lock-in. No data leaving your perimeter.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Cpu,
                  title: "CPU-runnable",
                  body: "Quantised SLMs deploy on existing servers — no GPU procurement."
                },
                {
                  icon: ShieldCheck,
                  title: "Air-gapped ready",
                  body: "Ship in a Docker image to disconnected hospital networks."
                },
                {
                  icon: Repeat2,
                  title: "Continuous refinement",
                  body: "Workflows feed validated outputs back into the next training cycle."
                },
                {
                  icon: Zap,
                  title: "Hours, not months",
                  body: "Pre-built medical pipelines mean your first usable model lands the same day."
                }
              ].map((item) => (
                <li key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <item.icon className="h-5 w-5 text-helix-300" />
                  <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{item.body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/custom-slm" className="btn-primary">
                See the fine-tune flow <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/security" className="btn-ghost">
                Read the security posture
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="card relative overflow-hidden p-8">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-helix-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-plasma-500/15 blur-3xl" />

              <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                  Custom SLM lifecycle
                </p>

                <ol className="mt-6 space-y-4">
                  {flow.map((step, i) => (
                    <motion.li
                      key={step.label}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="relative flex items-center gap-4 rounded-xl border border-white/10 bg-ink-900/60 p-4"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-helix-400 to-plasma-500 font-mono text-xs font-semibold text-ink-950">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{step.label}</p>
                        <p className="text-xs text-zinc-400">{step.sub}</p>
                      </div>
                      <span className="font-mono text-[11px] text-helix-300">
                        {i === 2 ? "~5h 12m" : "ready"}
                      </span>
                    </motion.li>
                  ))}
                </ol>

                <div className="mt-6 rounded-xl border border-helix-400/20 bg-helix-500/[0.06] p-4 text-xs text-helix-100">
                  <p className="font-medium text-helix-200">
                    Continuous loop
                  </p>
                  <p className="mt-1 leading-relaxed text-helix-100/80">
                    Each completed workflow generates new supervised pairs. Schedule nightly
                    refresh runs and your model improves while you sleep.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
