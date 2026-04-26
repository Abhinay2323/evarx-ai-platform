"use client";

import { motion } from "framer-motion";
import { Brain, Database, Workflow, Rocket } from "lucide-react";

const steps = [
  {
    icon: Brain,
    title: "Pick intelligence engine",
    body:
      "Choose Standard, Private (Evarx Medical SLM), or Custom (rapid fine-tune).",
    accent: "from-plasma-500/30 to-plasma-500/0"
  },
  {
    icon: Database,
    title: "Connect data sources",
    body:
      "EMRs, S3, SharePoint, PubMed, ClinicalTrials.gov, internal PDFs. Data both retrieves and refines.",
    accent: "from-helix-500/25 to-helix-500/0"
  },
  {
    icon: Workflow,
    title: "Design workflow",
    body:
      "Start from 10+ medical agent templates or compose your own with the drag-and-drop builder.",
    accent: "from-plasma-500/25 to-helix-500/10"
  },
  {
    icon: Rocket,
    title: "Deploy & scale",
    body:
      "One click to API. Run on CPU on-prem, in your VPC, or as managed SaaS. Usage-metered billing.",
    accent: "from-helix-500/30 to-plasma-500/10"
  }
];

export function Pipeline() {
  return (
    <section id="pipeline" className="relative py-24 sm:py-32">
      <div className="container-px">
        <div className="max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2 className="heading-section mt-5">
            From your data to a private agent in four steps.
          </h2>
          <p className="lede mt-5">
            One pipeline, three intelligence options. Every step is composable, audited, and
            deployable into the infrastructure you already trust.
          </p>
        </div>

        <ol className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card group relative"
            >
              <div
                className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${step.accent} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-helix-300">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-zinc-500">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
