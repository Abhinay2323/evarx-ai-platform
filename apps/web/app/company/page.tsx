import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Briefcase, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Evarx is the healthcare AI infrastructure layer for India. Founded in Hyderabad, building private medical AI rails for pharma, hospitals, and biotech."
};

const team = [
  { name: "Abhinay Krishna" },
  { name: "Omkar Reddy" },
  { name: "Pranith Nethikunta" }
];

const roles = [
  {
    title: "Founding ML engineer",
    location: "Hyderabad · On-site",
    body: "Lead the fine-tune harness and evaluation pipeline for medical SLMs."
  },
  {
    title: "Founding product engineer",
    location: "Hyderabad · On-site",
    body: "Ship the agent builder and customer-facing dashboard end to end."
  },
  {
    title: "Customer engineer · Pharma",
    location: "Hyderabad · Hybrid",
    body: "Be the technical lead for our first three pharma deployments."
  }
];

export default function CompanyPage() {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title={
          <>
            Healthcare AI{" "}
            <span className="bg-gradient-to-br from-helix-300 to-plasma-300 bg-clip-text text-transparent">
              infrastructure
            </span>{" "}
            for India.
          </>
        }
        blurb="Evarx is the private AI rails for the people who actually deliver care and discover medicine. Founded in Hyderabad, built for pharma, hospitals, and biotech teams that need domain-tuned models running inside their own perimeter."
      />

      <section className="py-20 sm:py-24">
        <div className="container-px grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Mission"
              title="Make every medical team five years more capable, today."
              body="Healthcare and pharma run on judgement applied to overwhelming amounts of unstructured information. We build the AI layer that absorbs that information — privately — so the humans can focus on the parts that demand them."
            />
          </div>
          <div className="lg:col-span-7">
            <div className="card p-8">
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                Principles
              </p>
              <ol className="mt-5 space-y-4 text-sm text-zinc-300">
                {[
                  "Private by default. The customer&apos;s data is the customer&apos;s asset.",
                  "Ship CPU-runnable artefacts. Hardware should not be the obstacle.",
                  "Evaluate ruthlessly. Medical mistakes are not abstract.",
                  "Be in the room. We sit with clinicians and CRAs, not just procurement."
                ].map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-helix-300">0{i + 1}</span>
                    <span dangerouslySetInnerHTML={{ __html: p }} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-px">
          <SectionHeading eyebrow="Team" title="The founders." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((t) => (
              <article key={t.name} className="card flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plasma-500 to-helix-500 font-display text-sm font-semibold text-ink-950">
                  {t.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <h3 className="font-display text-base font-semibold text-white">
                  {t.name}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="careers" className="py-20 sm:py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Careers"
            title="Open roles."
            body="Small team. Real medical impact. We hire builders who want to be in the room with clinicians and pharma teams, not abstracted away from them."
          />
          <div className="mt-12 grid gap-4">
            {roles.map((r) => (
              <article key={r.title} className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {r.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">{r.location}</p>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400">{r.body}</p>
                </div>
                <Link href={`mailto:${site.contactEmail}?subject=${encodeURIComponent("Application: " + r.title)}`} className="btn-ghost shrink-0">
                  <Briefcase className="h-4 w-4" /> Apply
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 sm:py-28">
        <div className="container-px">
          <div className="card grid gap-8 p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <SectionHeading
                eyebrow="Contact"
                title="Reach the founders directly."
                body="No CRM. No SDR cold-cycle. A real person reads your message — usually within a business day."
              />
            </div>
            <div className="lg:col-span-5 space-y-3 text-sm">
              <p className="flex items-center gap-3 text-zinc-200">
                <Mail className="h-4 w-4 text-helix-300" />
                <Link href={`mailto:${site.contactEmail}`} className="link-underline">
                  {site.contactEmail}
                </Link>
              </p>
              <p className="flex items-center gap-3 text-zinc-200">
                <MapPin className="h-4 w-4 text-helix-300" /> {site.location}
              </p>
              <Link href="/demo" className="btn-primary mt-4">
                Book a demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
