"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FlaskConical,
  Microscope,
  Stethoscope,
  ClipboardList,
  Pill,
  ScrollText,
  Hospital,
  Shield
} from "lucide-react";

const cases = [
  {
    icon: FlaskConical,
    title: "Clinical trial assistant",
    body: "Protocol summarization, eligibility extraction, ICF Q&A across study sites.",
    tag: "R&D"
  },
  {
    icon: Pill,
    title: "Pharmacovigilance copilot",
    body: "ICSR triage, MedDRA coding suggestions, signal narrative drafting.",
    tag: "Safety"
  },
  {
    icon: ScrollText,
    title: "Medical writing copilot",
    body: "CSR sections, plain-language summaries, regulatory submission drafting.",
    tag: "Med affairs"
  },
  {
    icon: ClipboardList,
    title: "Regulatory Q&A bot",
    body: "CDSCO, FDA, EMA guidance retrieval grounded in your dossier history.",
    tag: "Regulatory"
  },
  {
    icon: Microscope,
    title: "Literature monitoring",
    body: "Daily PubMed digests filtered by therapeutic area, with extracted endpoints.",
    tag: "Med affairs"
  },
  {
    icon: Stethoscope,
    title: "MSL field assistant",
    body: "Real-time scientific Q&A grounded in your approved content library.",
    tag: "Field"
  },
  {
    icon: Hospital,
    title: "Hospital EHR triage",
    body: "Pre-visit summarization and structured note drafting from unstructured records.",
    tag: "Provider"
  },
  {
    icon: Shield,
    title: "Compliance review agent",
    body: "Marketing collateral pre-screen against approved labels and PI.",
    tag: "Legal"
  }
];

export function UseCases() {
  return (
    <section id="use-cases" className="relative py-24 sm:py-32">
      <div className="container-px">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow">Built for medical work</span>
            <h2 className="heading-section mt-5">
              Eight agents your teams can ship this quarter.
            </h2>
          </div>
          <Link
            href="/agents"
            className="hidden text-sm text-helix-300 link-underline sm:inline-flex"
          >
            View all 12+ templates →
          </Link>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="card group relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-helix-500/0 blur-2xl transition-all duration-500 group-hover:bg-helix-500/20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-helix-300">
                    <c.icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    {c.tag}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-white">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{c.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
