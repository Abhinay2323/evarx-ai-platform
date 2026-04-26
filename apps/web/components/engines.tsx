"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cloud, Lock, Sparkles, Check, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

const engines = [
  {
    badge: "Standard",
    icon: Cloud,
    name: "Evarx Standard",
    blurb: "Hosted general-purpose proprietary LLM for non-sensitive workflows.",
    points: [
      "Strong general reasoning",
      "Pay-per-token pricing",
      "Hosted by Evarx · in-region",
      "Ideal for prototyping"
    ],
    accent: "border-plasma-500/30",
    chip: "bg-plasma-500/10 text-plasma-200 border-plasma-500/30",
    highlight: false,
    cta: { href: "/platform#engines-standard", label: "Standard tier" }
  },
  {
    badge: "Private",
    icon: Lock,
    name: "Evarx Medical SLM",
    blurb: "Healthcare-trained small language model, deployable in your VPC.",
    points: [
      "Pre-trained on medical corpora",
      "On-prem or VPC deployment",
      "Zero data egress",
      "Compliant with DPDP Act & HIPAA"
    ],
    accent: "border-white/15",
    chip: "bg-white/5 text-zinc-200 border-white/15",
    highlight: false,
    cta: { href: "/platform#engines-private", label: "Private tier" }
  },
  {
    badge: "Custom · USP",
    icon: Sparkles,
    name: "Rapid Fine-Tuned SLM",
    blurb: "Upload your data, get a custom-trained CPU-runnable model in hours.",
    points: [
      "Domain-specific fine-tune in <6 hours",
      "Runs on CPU — no GPU required",
      "Take it in-house, ship it air-gapped",
      "Continuously refines with new data"
    ],
    accent: "border-helix-400/40",
    chip: "bg-helix-500/10 text-helix-300 border-helix-400/30",
    highlight: true,
    cta: { href: "/custom-slm", label: "Explore Custom SLM" }
  }
];

export function Engines() {
  return (
    <section id="engines" className="relative py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="container-px">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="eyebrow">Three intelligence engines</span>
            <h2 className="heading-section mt-5">One platform. Pick how private you need to be.</h2>
          </div>
          <p className="max-w-md text-sm text-zinc-400">
            Most customers start on Standard, move sensitive workloads to Private, and unlock
            durable advantage with a Custom fine-tune trained on their proprietary data.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {engines.map((e, i) => (
            <motion.article
              key={e.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "card group flex flex-col",
                e.highlight && "shadow-glow ring-1 ring-helix-400/30"
              )}
            >
              {e.highlight && (
                <div className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-helix-300 to-transparent" />
              )}
              <header className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
                    e.chip
                  )}
                >
                  {e.badge}
                </span>
                <e.icon className="h-5 w-5 text-zinc-400 group-hover:text-white" />
              </header>

              <h3 className="mt-6 font-display text-2xl font-semibold text-white">{e.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{e.blurb}</p>

              <ul className="mt-6 space-y-2.5">
                {e.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-helix-400" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex-1" />
              <Link
                href={e.cta.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white link-underline"
              >
                {e.cta.label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
