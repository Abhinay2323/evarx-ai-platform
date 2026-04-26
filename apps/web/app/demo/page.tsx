import type { Metadata } from "next";
import { CalendarCheck, ShieldCheck, Stethoscope, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { DemoForm } from "@/components/demo-form";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "Request a 30-minute call with the Evarx team. We&apos;ll map your highest-leverage medical workflow and scope a private fine-tune."
};

const promises = [
  {
    icon: CalendarCheck,
    title: "30 minutes, founder-led",
    body: "No SDR cycle. A founder runs the call and follows up directly."
  },
  {
    icon: Stethoscope,
    title: "Workflow-mapped",
    body: "We&apos;ll sketch the agent on a whiteboard before talking commercials."
  },
  {
    icon: Sparkles,
    title: "Fixed-price scope",
    body: "If the fit is right, you leave with a written scope you can sign."
  },
  {
    icon: ShieldCheck,
    title: "NDA on first request",
    body: "Mutual NDA available before the call if your topic requires it."
  }
];

export default function DemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Book a demo"
        title="Tell us where AI would change your week."
        blurb="A 30-minute call. We&apos;ll map a workflow, sketch a fine-tune, and tell you exactly what runs in your VPC by next week."
      />

      <section className="py-12">
        <div className="container-px grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <DemoForm />
          </div>
          <div className="lg:col-span-5 space-y-4">
            {promises.map((p) => (
              <div key={p.title} className="card flex items-start gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-helix-500/10 text-helix-300">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p
                    className="mt-1 text-xs text-zinc-400"
                    dangerouslySetInnerHTML={{ __html: p.body }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
