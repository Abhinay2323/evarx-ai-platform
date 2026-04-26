import { Award } from "lucide-react";

export function LogoCloud() {
  return (
    <section className="relative border-y border-white/10 bg-ink-900/40 py-10">
      <div className="container-px">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Recognised by
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
          <Award
            className="h-5 w-5 shrink-0 text-zinc-300"
            aria-hidden="true"
          />
          <p className="font-display text-base font-semibold tracking-tight text-zinc-200 sm:text-lg">
            Eli Lilly SLM provider —{" "}
            <span className="font-medium text-zinc-400">
              finalist via T-Hub accelerator
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
