"use client";

import { motion } from "framer-motion";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Cpu,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useConsole } from "@/lib/console-store";
import { NewFinetuneModal } from "@/components/console/new-finetune-modal";
import { cn } from "@/lib/cn";

export function FinetunePanel() {
  const {
    state: { finetuneJobs },
  } = useConsole();
  const [openNew, setOpenNew] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Fine-tune jobs</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Latest runs in your tenant
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-1 rounded-full border border-helix-400/30 bg-helix-500/10 px-3 py-1 text-[11px] font-medium text-helix-200 hover:bg-helix-500/20"
        >
          <Plus className="h-3 w-3" />
          New job
        </button>
      </header>

      <ul className="mt-5 space-y-3">
        {finetuneJobs.map((j) => (
          <li
            key={j.id}
            className={cn(
              "rounded-xl border p-4",
              j.status === "running"
                ? "border-helix-400/30 bg-helix-500/[0.05]"
                : j.status === "queued"
                  ? "border-amber-400/30 bg-amber-500/[0.05]"
                  : "border-white/10 bg-white/[0.02]",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    j.status === "running"
                      ? "bg-plasma-500/20 text-plasma-200"
                      : j.status === "queued"
                        ? "bg-amber-500/20 text-amber-200"
                        : j.stage === "Archived"
                          ? "bg-white/5 text-zinc-400"
                          : "bg-helix-500/20 text-helix-200",
                  )}
                >
                  {j.status === "running" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : j.status === "queued" ? (
                    <Clock3 className="h-4 w-4" />
                  ) : j.stage === "Archived" ? (
                    <Archive className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <p className="font-mono text-xs text-white">{j.id}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    base = {j.base} · {j.stage}
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                {j.status === "running" ? `ETA ${j.eta}` : j.started}
              </p>
            </div>

            {j.status === "running" ? (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-helix-400 to-plasma-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(j.progress * 100)}%` }}
                    transition={{ duration: 1.2 }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-helix-300">
                  {Math.round(j.progress * 100)}% · loss decreasing
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-xs text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-helix-300" />
          v2 currently serving production · v3 will auto-promote on eval pass
        </span>
      </div>

      <NewFinetuneModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
