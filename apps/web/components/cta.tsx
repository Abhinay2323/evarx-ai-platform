import Link from "next/link";
import { ArrowUpRight, CalendarCheck } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="container-px">
        <div className="card relative overflow-hidden p-10 sm:p-14">
          <div className="absolute -inset-32 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(59,77,255,0.25),transparent_60%)]" />
          <div className="absolute inset-0 -z-10 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]" />

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 className="heading-section">
                Ready to engineer your team&apos;s
                <span className="bg-gradient-to-br from-helix-300 to-plasma-300 bg-clip-text text-transparent">
                  {" "}
                  private medical AI
                </span>
                ?
              </h2>
              <p className="lede mt-5">
                A 30-minute call. We&apos;ll map your highest-leverage workflow, scope a
                fine-tune, and show you what runs in your VPC by next week.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <CalendarCheck className="h-4 w-4 text-helix-300" />
                  Typical first response within 1 business day.
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <Link href="/demo" className="btn-primary justify-center">
                    Book a demo <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/pricing" className="btn-ghost justify-center">
                    See pricing
                  </Link>
                </div>
                <p className="mt-4 text-[11px] text-zinc-500">
                  No spam. Your message reaches a founder, not a CRM funnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
