"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  Lock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/cn";

type Engine = "Standard" | "Private" | "Custom";

interface Option {
  label: string;
  hint?: string;
  weights: Record<Engine, number>;
}

interface Question {
  id: string;
  prompt: string;
  options: Option[];
}

const questions: Question[] = [
  {
    id: "data",
    prompt: "How sensitive is the data flowing through these workflows?",
    options: [
      {
        label: "Public / non-PHI only",
        hint: "Marketing copy, public literature, etc.",
        weights: { Standard: 3, Private: 1, Custom: 0 }
      },
      {
        label: "Internal but not regulated",
        hint: "SOPs, internal decks, business data.",
        weights: { Standard: 1, Private: 3, Custom: 2 }
      },
      {
        label: "Regulated · PHI / IP-bearing",
        hint: "EMR data, trial data, proprietary chemistry.",
        weights: { Standard: 0, Private: 2, Custom: 3 }
      }
    ]
  },
  {
    id: "deploy",
    prompt: "Where must the model run?",
    options: [
      {
        label: "Anywhere — hosted is fine",
        weights: { Standard: 3, Private: 1, Custom: 1 }
      },
      {
        label: "In our VPC / cloud account",
        weights: { Standard: 0, Private: 3, Custom: 2 }
      },
      {
        label: "On-prem / air-gapped",
        weights: { Standard: 0, Private: 1, Custom: 3 }
      }
    ]
  },
  {
    id: "volume",
    prompt: "What's your expected steady-state volume?",
    options: [
      {
        label: "Light · < 5M tokens / month",
        weights: { Standard: 3, Private: 1, Custom: 0 }
      },
      {
        label: "Medium · 5–50M tokens / month",
        weights: { Standard: 1, Private: 3, Custom: 2 }
      },
      {
        label: "Heavy · 50M+ tokens / month",
        weights: { Standard: 0, Private: 2, Custom: 3 }
      }
    ]
  },
  {
    id: "lockin",
    prompt: "How important is owning the model weights?",
    options: [
      {
        label: "Not important — convenience first",
        weights: { Standard: 3, Private: 1, Custom: 0 }
      },
      {
        label: "Prefer weights in our perimeter",
        weights: { Standard: 0, Private: 3, Custom: 2 }
      },
      {
        label: "We must own the weights outright",
        weights: { Standard: 0, Private: 1, Custom: 3 }
      }
    ]
  }
];

const engines: Record<
  Engine,
  {
    icon: typeof Cloud;
    title: string;
    blurb: string;
    href: string;
    bullets: string[];
    accent: string;
  }
> = {
  Standard: {
    icon: Cloud,
    title: "Standard · Evarx Standard LLM",
    blurb:
      "Hosted proprietary general-purpose LLM. Lowest friction. Best when data is non-sensitive and volume is light.",
    href: "/platform#engines-standard",
    bullets: [
      "Fastest start — minutes to first agent",
      "Pay-per-token, no infra footprint",
      "Best for prototypes & non-PHI work"
    ],
    accent: "from-plasma-500/30 to-plasma-500/0"
  },
  Private: {
    icon: Lock,
    title: "Private · Evarx Medical SLM",
    blurb:
      "A medical-pre-trained SLM in your VPC. Best when data residency matters and you want a managed offering.",
    href: "/platform#engines-private",
    bullets: [
      "DPDP-compliant by default",
      "VPC or on-prem deploy",
      "Strong baseline on medical domain"
    ],
    accent: "from-white/15 to-transparent"
  },
  Custom: {
    icon: Sparkles,
    title: "Custom · Fine-tuned SLM",
    blurb:
      "Your data. Your weights. CPU-runnable. Best when you need air-gap deploy or durable advantage from your proprietary data.",
    href: "/custom-slm",
    bullets: [
      "Trained on your proprietary data",
      "CPU-runnable, air-gappable",
      "Continuous improvement loop"
    ],
    accent: "from-helix-500/30 to-plasma-500/10"
  }
};

export function EngineQuiz() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});

  const totalSteps = questions.length;
  const done = step >= totalSteps;

  const result: Engine | null = (() => {
    if (!done) return null;
    const totals: Record<Engine, number> = { Standard: 0, Private: 0, Custom: 0 };
    questions.forEach((q) => {
      const pickIdx = picks[q.id];
      if (pickIdx === undefined) return;
      const opt = q.options[pickIdx];
      (Object.keys(totals) as Engine[]).forEach((k) => {
        totals[k] += opt.weights[k];
      });
    });
    return (Object.entries(totals) as [Engine, number][]).sort((a, b) => b[1] - a[1])[0][0];
  })();

  function pick(qid: string, optIdx: number) {
    setPicks((p) => ({ ...p, [qid]: optIdx }));
    setStep((s) => s + 1);
  }

  function reset() {
    setPicks({});
    setStep(0);
  }

  return (
    <section className="py-12">
      <div className="container-px max-w-3xl">
        <div className="card overflow-hidden p-0">
          {!done ? (
            <div className="p-8">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-helix-300">
                  Question {step + 1} of {totalSteps}
                </p>
                <p className="text-[11px] text-zinc-500">~30 seconds</p>
              </div>

              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-helix-400 to-plasma-400"
                  initial={false}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="mt-8 font-display text-2xl font-semibold text-white">
                    {questions[step].prompt}
                  </h3>

                  <div className="mt-6 grid gap-3">
                    {questions[step].options.map((opt, i) => (
                      <button
                        key={opt.label}
                        onClick={() => pick(questions[step].id, i)}
                        className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-helix-400/30 hover:bg-helix-500/[0.06]"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] font-mono text-[11px] text-zinc-300 transition group-hover:border-helix-400/40 group-hover:text-helix-200">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{opt.label}</p>
                          {opt.hint ? (
                            <p className="mt-1 text-xs text-zinc-500">{opt.hint}</p>
                          ) : null}
                        </div>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-helix-300 group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="mt-6 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  ← Back to previous question
                </button>
              ) : null}
            </div>
          ) : (
            result && <Result engine={result} reset={reset} />
          )}
        </div>
      </div>
    </section>
  );
}

function Result({ engine, reset }: { engine: Engine; reset: () => void }) {
  const e = engines[engine];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative p-8"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br",
          e.accent
        )}
      />
      <div className="flex items-center gap-2 text-helix-300">
        <ShieldCheck className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wider">Recommendation</p>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-helix-400 to-plasma-500 text-ink-950">
          <e.icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold text-white">{e.title}</p>
          <p className="mt-1 text-sm text-zinc-400">{e.blurb}</p>
        </div>
      </div>

      <ul className="mt-8 space-y-2.5">
        {e.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-zinc-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-helix-400" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={e.href} className="btn-primary">
          Read more <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/demo" className="btn-ghost">
          Book a demo
        </Link>
        <button onClick={reset} className="btn-ghost">
          <RotateCcw className="h-4 w-4" /> Retake
        </button>
      </div>

      <p className="mt-6 text-[11px] text-zinc-500">
        This is guidance, not gospel. Many customers run two engines side-by-side — we&apos;ll help
        you split workloads on a 30-minute call.
      </p>
    </motion.div>
  );
}
