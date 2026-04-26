import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { solutions } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Evarx for Pharma R&D, Clinical Operations, Medical Affairs, Regulatory, and Hospitals."
};

export default function SolutionsIndex() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Built for the people who make medicine work."
        blurb="One platform, configured for the function you lead. Pick the role closest to yours to see the agents, outcomes, and integrations that fit."
      />

      <section className="py-16">
        <div className="container-px grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <Link
              key={s.slug}
              href={`/solutions/${s.slug}`}
              className="card group flex flex-col transition hover:border-white/20"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-helix-300">
                {s.role}
              </p>
              <h3 className="mt-4 font-display text-xl font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-3 text-sm text-zinc-400">{s.blurb}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-helix-300">
                Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
