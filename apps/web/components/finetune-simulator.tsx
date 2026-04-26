"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Loader2,
  ScanSearch,
  Upload,
  WandSparkles,
  Activity,
  Server
} from "lucide-react";
import { cn } from "@/lib/cn";

type StageId = "upload" | "validate" | "train" | "evaluate" | "deploy";

interface Stage {
  id: StageId;
  name: string;
  icon: typeof Upload;
  durationMs: number;
  logs: string[];
  metric?: { label: string; from: number; to: number; format: (n: number) => string };
}

const stages: Stage[] = [
  {
    id: "upload",
    name: "Upload",
    icon: Upload,
    durationMs: 4000,
    logs: [
      "ingest · 12 PDFs received from /uploads",
      "ingest · fingerprinting · sha256 batch",
      "ingest · 4,182 medical SOPs detected",
      "ingest · 1.2 GB ingested · OK"
    ]
  },
  {
    id: "validate",
    name: "Validate",
    icon: ScanSearch,
    durationMs: 5500,
    logs: [
      "phi-scan · running presidio + medical regex",
      "phi-scan · 812 PHI entities flagged",
      "phi-scan · redacting · 100% coverage verified",
      "schema · 4,182 / 4,182 docs pass schema",
      "quality · avg score 0.92 · 31 docs rejected"
    ]
  },
  {
    id: "train",
    name: "Fine-tune",
    icon: WandSparkles,
    durationMs: 8000,
    logs: [
      "trainer · base = evarx-med-3b · LoRA r=16",
      "trainer · epoch 1/3 · loss=2.18 → 1.42",
      "trainer · epoch 2/3 · loss=1.42 → 1.05",
      "trainer · epoch 3/3 · loss=1.05 → 0.81",
      "trainer · checkpoint saved to s3://evarx-tenants/acme/v1.bin"
    ],
    metric: { label: "Loss", from: 2.18, to: 0.81, format: (n) => n.toFixed(2) }
  },
  {
    id: "evaluate",
    name: "Evaluate",
    icon: Activity,
    durationMs: 6500,
    logs: [
      "eval · 240 golden test cases queued",
      "eval · faithfulness · 0.71 → 0.93",
      "eval · clinical accuracy · 0.62 → 0.88",
      "eval · hallucination rate · 4.1% → 0.7%",
      "eval · regression gate · PASS"
    ],
    metric: {
      label: "Accuracy",
      from: 62,
      to: 88,
      format: (n) => `${Math.round(n)}%`
    }
  },
  {
    id: "deploy",
    name: "Deploy",
    icon: Server,
    durationMs: 5000,
    logs: [
      "package · quantising to Q4_K_M (gguf)",
      "package · final size 1.9 GB · OK",
      "deploy · pushing to acme-vpc.evarx-internal:443",
      "deploy · health check OK · 124 ms / token",
      "deploy · ready · evarx-med-3b-acme-v1"
    ]
  }
];

const totalDuration = stages.reduce((s, x) => s + x.durationMs, 0);

export function FineTuneSimulator() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const lastTick = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(t: number) {
      if (!running) {
        lastTick.current = t;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (lastTick.current == null) lastTick.current = t;
      const dt = t - lastTick.current;
      lastTick.current = t;
      setElapsed((e) => {
        const next = e + dt;
        if (next >= totalDuration) {
          setRunning(false);
          setDone(true);
          return totalDuration;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTick.current = null;
    };
  }, [running]);

  function start() {
    if (done) reset();
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setElapsed(0);
    setDone(false);
  }

  const { activeIdx, stageElapsed } = (() => {
    let acc = 0;
    for (let i = 0; i < stages.length; i++) {
      const next = acc + stages[i].durationMs;
      if (elapsed < next) return { activeIdx: i, stageElapsed: elapsed - acc };
      acc = next;
    }
    return {
      activeIdx: stages.length - 1,
      stageElapsed: stages[stages.length - 1].durationMs
    };
  })();

  const overallPct = Math.round((elapsed / totalDuration) * 100);

  return (
    <section className="py-20 sm:py-28">
      <div className="container-px">
        <div className="card overflow-hidden p-0">
          <header className="flex flex-col gap-3 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-helix-300">
                Live demo
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">
                Watch a custom fine-tune run end-to-end.
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {running ? (
                <button onClick={pause} className="btn-ghost">
                  <Pause className="h-4 w-4" /> Pause
                </button>
              ) : (
                <button onClick={start} className="btn-primary">
                  <Play className="h-4 w-4" /> {done ? "Run again" : elapsed > 0 ? "Resume" : "Start"}
                </button>
              )}
              <button onClick={reset} className="btn-ghost" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="grid gap-0 lg:grid-cols-12">
            <div className="border-b border-white/10 p-6 lg:col-span-5 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Overall</span>
                <span className="font-mono text-helix-300">{overallPct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-helix-400 to-plasma-400"
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>

              <ol className="mt-6 space-y-3">
                {stages.map((s, i) => {
                  const isActive = i === activeIdx && elapsed > 0 && !done;
                  const isComplete = elapsed > 0 && (i < activeIdx || done);
                  const stagePct =
                    isComplete
                      ? 100
                      : isActive
                        ? Math.round((stageElapsed / s.durationMs) * 100)
                        : 0;

                  return (
                    <li
                      key={s.id}
                      className={cn(
                        "rounded-xl border p-3 transition",
                        isActive
                          ? "border-helix-400/40 bg-helix-500/[0.05]"
                          : isComplete
                            ? "border-white/10 bg-white/[0.02]"
                            : "border-white/5 bg-white/[0.01] opacity-70"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            isComplete
                              ? "bg-helix-500/20 text-helix-200"
                              : isActive
                                ? "bg-plasma-500/20 text-plasma-200"
                                : "bg-white/5 text-zinc-500"
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isActive ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <s.icon className="h-4 w-4" />
                          )}
                        </span>
                        <p className="flex-1 text-sm font-medium text-white">{s.name}</p>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {Math.round(s.durationMs / 1000)}s
                        </span>
                      </div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            isComplete
                              ? "bg-helix-400/60"
                              : "bg-gradient-to-r from-helix-400 to-plasma-400"
                          )}
                          animate={{ width: `${stagePct}%` }}
                          transition={{ duration: 0.1, ease: "linear" }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>

              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-xl border border-helix-400/30 bg-helix-500/[0.06] p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-helix-200">
                    <Cpu className="h-4 w-4" /> evarx-med-3b-acme-v1 · ready
                  </p>
                  <p className="mt-1 text-xs text-helix-100/80">
                    Deployed to acme-vpc · 124 ms / token on 16 vCPU · 0.7% hallucination rate.
                  </p>
                </motion.div>
              )}
            </div>

            <div className="p-6 lg:col-span-7">
              <Console activeIdx={activeIdx} stageElapsed={stageElapsed} done={done} elapsed={elapsed} />
              <MetricStream activeIdx={activeIdx} stageElapsed={stageElapsed} done={done} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Console({
  activeIdx,
  stageElapsed,
  done,
  elapsed
}: {
  activeIdx: number;
  stageElapsed: number;
  done: boolean;
  elapsed: number;
}) {
  const visible: { stage: string; line: string; key: string }[] = [];
  for (let i = 0; i <= activeIdx; i++) {
    const s = stages[i];
    const isCurrent = i === activeIdx && !done;
    const stageProgress = isCurrent
      ? Math.min(stageElapsed / s.durationMs, 1)
      : 1;
    const linesToShow = Math.floor(stageProgress * s.logs.length);
    for (let l = 0; l < linesToShow; l++) {
      visible.push({ stage: s.name, line: s.logs[l], key: `${s.id}-${l}` });
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/80 p-4 font-mono text-[11px]">
      <div className="mb-2 flex items-center justify-between text-zinc-500">
        <span>~ evarx · finetune.log</span>
        <span>{elapsed === 0 ? "ready" : `t+${(elapsed / 1000).toFixed(1)}s`}</span>
      </div>
      <div className="h-44 overflow-hidden">
        <AnimatePresence initial={false}>
          {visible.slice(-14).map((l) => (
            <motion.div
              key={l.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
              className="flex gap-3 leading-relaxed"
            >
              <span className="w-16 shrink-0 text-helix-300">[{l.stage.toLowerCase()}]</span>
              <span className="text-zinc-300">{l.line}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {visible.length === 0 && (
          <p className="text-zinc-600">Press start to play the fine-tune…</p>
        )}
      </div>
    </div>
  );
}

function MetricStream({
  activeIdx,
  stageElapsed,
  done
}: {
  activeIdx: number;
  stageElapsed: number;
  done: boolean;
}) {
  const stage = stages[activeIdx];
  const metric = stage?.metric;
  const progress = done ? 1 : Math.min(stageElapsed / (stage?.durationMs || 1), 1);
  const value = metric ? metric.from + (metric.to - metric.from) * progress : null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <Tile label="Stage" value={stage?.name ?? "—"} />
      <Tile
        label={metric?.label ?? "Tokens / sec"}
        value={
          value !== null && metric
            ? metric.format(value)
            : done
              ? "8.0 t/s"
              : "—"
        }
      />
      <Tile
        label="Engine"
        value={done ? "evarx-med-3b · CPU · Q4_K_M" : "evarx-trainer · GPU"}
      />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-sm text-white">{value}</p>
    </div>
  );
}
