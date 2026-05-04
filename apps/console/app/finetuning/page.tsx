import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Cpu,
  Database,
  GraduationCap,
  Rocket
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

export const metadata = { title: "Fine-tuning · Evarx Console" };

const STAGES = [
  {
    icon: Database,
    name: "Curate corpus",
    state: "done",
    desc:
      "Upload a representative slice of your private data — protocols, SOPs, regulatory correspondence, narratives — to a dataset bucket.",
    eta: "Weeks 1-2"
  },
  {
    icon: GraduationCap,
    name: "Fine-tune base SLM",
    state: "active",
    desc:
      "LoRA adapter trained on your corpus. We use a CPU-runnable base (1-3B params) so the resulting weights deploy on-prem without GPUs.",
    eta: "Active — internal"
  },
  {
    icon: CheckCircle2,
    name: "Eval pack",
    state: "queued",
    desc:
      "Side-by-side bench against Evarx Standard on your held-out questions. Domain accuracy, refusal rate, and citation fidelity scored automatically.",
    eta: "Mid-May 2026"
  },
  {
    icon: Rocket,
    name: "Deploy as evarx-medical",
    state: "queued",
    desc:
      "Promote the trained adapter to the evarx-medical alias in LiteLLM. The model picker in chat starts routing to your fine-tune; nothing else changes for end users.",
    eta: "Late May 2026"
  }
];

export default function FineTuningPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-display font-bold text-white">
            Evarx Console
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl border border-white/10 bg-helix-500/10 p-2 text-helix-300">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-white">
                Fine-tuning
              </h1>
              <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                Work in progress
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              The medical SLM that makes Evarx, Evarx — fine-tuned on your data,
              CPU-runnable, deployable inside your perimeter.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-sm text-amber-100">
          <p className="font-medium">Self-serve fine-tuning lands soon.</p>
          <p className="mt-1 text-amber-200/80">
            Today we run fine-tunes for design-partner orgs on request. Once the
            in-house pipeline (right) is wired into the console, you'll be able
            to kick off a job from this page using the documents you've already
            uploaded. The model picker on Chat already exposes the{" "}
            <Link href="/models" className="underline">
              evarx-medical
            </Link>{" "}
            alias so the surface is stable.
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-300">The pipeline</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Each org gets its own fine-tune trained on its corpus — never shared,
            never trained on cross-tenant data.
          </p>

          <ol className="mt-5 space-y-4">
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const tone =
                s.state === "done"
                  ? "border-helix-400/40 bg-helix-400/10 text-helix-200"
                  : s.state === "active"
                    ? "border-plasma-400/40 bg-plasma-400/10 text-plasma-200"
                    : "border-white/10 bg-white/5 text-zinc-400";
              return (
                <li
                  key={s.name}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-ink-900/60 p-5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-600">
                        Stage {i + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{s.name}</h3>
                      {s.state === "done" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-helix-300" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-zinc-600" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{s.desc}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-500">
                      {s.eta}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-500"
          >
            Start a fine-tune (coming soon)
          </button>
          <a
            href="mailto:contact@evarx.in?subject=Fine-tuning%20design%20partner"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-110"
          >
            Become a design partner
          </a>
          <span className="text-[11px] text-zinc-500">
            We onboard 2-3 orgs per cohort.
          </span>
        </div>
      </main>
    </div>
  );
}
