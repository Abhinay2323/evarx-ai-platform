"use client";

import { Pause, Play, Workflow as WorkflowIcon } from "lucide-react";
import { useConsole } from "@/lib/console-store";
import { cn } from "@/lib/cn";

export function WorkflowsTable() {
  const {
    state: { workflows, search },
  } = useConsole();

  const q = search.trim().toLowerCase();
  const filtered = q
    ? workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.trigger.toLowerCase().includes(q),
      )
    : workflows;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">Workflows</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {filtered.length} workflow{filtered.length === 1 ? "" : "s"}
            {q ? ` matching "${search}"` : ""}
          </p>
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <WorkflowIcon className="mx-auto mb-2 h-5 w-5 text-zinc-600" />
          <p className="text-sm text-zinc-500">
            {q ? `No workflows match "${search}".` : "No workflows yet."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {filtered.map((w) => (
            <li
              key={w.id}
              className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{w.name}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                      w.status === "active"
                        ? "border-helix-400/30 bg-helix-500/10 text-helix-200"
                        : "border-zinc-500/30 bg-white/5 text-zinc-400",
                    )}
                  >
                    {w.status === "active" ? (
                      <Play className="h-2.5 w-2.5" />
                    ) : (
                      <Pause className="h-2.5 w-2.5" />
                    )}
                    {w.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{w.description}</p>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  {w.agents.length} agent
                  {w.agents.length === 1 ? "" : "s"} · {w.agents.join(", ")}
                </p>
              </div>
              <div className="self-center text-xs text-zinc-400">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Trigger
                </span>
                <p className="mt-0.5 font-mono">{w.trigger}</p>
              </div>
              <div className="self-center text-right text-xs text-zinc-400">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Runs · 7d
                </span>
                <p className="mt-0.5 font-mono">
                  {w.runs.toLocaleString("en-IN")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
