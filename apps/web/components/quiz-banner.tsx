import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function QuizBanner() {
  return (
    <section className="py-12">
      <div className="container-px">
        <Link
          href="/which-engine"
          className="card group flex flex-col items-start justify-between gap-4 p-6 transition hover:border-white/20 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-helix-400 to-plasma-500 text-ink-950">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Not sure which engine fits your team?
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                A 30-second diagnostic across data sensitivity, deployment, and volume.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-helix-300">
            Take the diagnostic
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
