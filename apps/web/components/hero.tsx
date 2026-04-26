"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { HelixVisual } from "@/components/helix-visual";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="absolute inset-0 -z-10 bg-grid-fade" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent)]" />
      <div className="absolute inset-0 -z-10 bg-helix-glow" />

      <div className="container-px grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Medical AI platform · India-first
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="heading-display mt-6"
          >
            Engineering the{" "}
            <span className="bg-gradient-to-br from-helix-300 via-helix-400 to-plasma-400 bg-clip-text text-transparent">
              biology of tomorrow
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lede mt-6"
          >
            Evarx is the medical AI platform for pharma and healthcare. Build private agents,
            fine-tune CPU-runnable medical SLMs on your own data, and deploy in your own
            infrastructure — in hours, not months.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link href="/demo" className="btn-primary">
              Book a demo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/platform" className="btn-ghost">
              Explore the platform
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6"
          >
            {[
              { k: "< 6 hrs", v: "to fine-tune a domain SLM" },
              { k: "100%", v: "in your VPC or on-prem" },
              { k: "CPU-ready", v: "no GPU farm required" }
            ].map((item) => (
              <div key={item.k}>
                <dt className="font-display text-2xl font-semibold text-white">{item.k}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-zinc-400">{item.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative lg:col-span-5"
        >
          <HelixVisual />
        </motion.div>
      </div>
    </section>
  );
}
