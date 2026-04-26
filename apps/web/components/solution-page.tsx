import Link from "next/link";
import { ArrowRight, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import type { Solution } from "@/lib/solutions";

export function SolutionPage({ solution }: { solution: Solution }) {
  return (
    <>
      <PageHero eyebrow={solution.role} title={solution.title} blurb={solution.blurb}>
        <div className="flex flex-wrap gap-3">
          <Link href="/demo" className="btn-primary">
            Book a demo <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/agents" className="btn-ghost">
            See agent templates
          </Link>
        </div>
      </PageHero>

      <section className="py-16">
        <div className="container-px">
          <div className="card grid gap-6 p-8 sm:grid-cols-3">
            {solution.outcomes.map((o) => (
              <div key={o.label} className="border-l border-white/10 pl-5 first:border-l-0 first:pl-0">
                <p className="font-display text-3xl font-semibold text-white">{o.metric}</p>
                <p className="mt-1 text-sm text-zinc-400">{o.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-px grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Where it hurts"
              title={solution.hero}
              body="Below are the friction points we hear from teams in this function — and the agents that resolve them."
            />
            <ul className="mt-8 space-y-3">
              {solution.pains.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-zinc-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span dangerouslySetInnerHTML={{ __html: p }} />
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4">
              {solution.agents.map((a) => (
                <article key={a.title} className="card flex flex-col">
                  <h3 className="font-display text-lg font-semibold text-white">{a.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{a.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-px">
          <div className="card p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-helix-300" />
              <h3 className="font-display text-lg font-semibold text-white">
                Why teams choose Evarx for this
              </h3>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {solution.proofPoints.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-helix-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
