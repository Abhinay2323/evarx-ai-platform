"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, X } from "lucide-react";
import { agents, agentFunctions, agentAudiences, type Agent } from "@/lib/agents";
import { cn } from "@/lib/cn";

export function AgentsGallery() {
  const [q, setQ] = useState("");
  const [fn, setFn] = useState<(typeof agentFunctions)[number]>("All");
  const [aud, setAud] = useState<(typeof agentAudiences)[number]>("All");
  const [selected, setSelected] = useState<Agent | null>(null);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      if (fn !== "All" && a.function !== fn) return false;
      if (aud !== "All" && a.audience !== aud) return false;
      if (q.trim()) {
        const needle = q.toLowerCase();
        return (
          a.name.toLowerCase().includes(needle) ||
          a.short.toLowerCase().includes(needle) ||
          a.specialty.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [q, fn, aud]);

  return (
    <section className="py-16">
      <div className="container-px">
        <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              placeholder="Search agents (e.g. 'protocol', 'cardiology')"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-ink-900/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-helix-400/40 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={fn} onChange={(v) => setFn(v as typeof fn)} options={agentFunctions} />
            <Select value={aud} onChange={(v) => setAud(v as typeof aud)} options={agentAudiences} />
          </div>
        </div>

        <p className="mt-5 text-xs text-zinc-500">
          {filtered.length} of {agents.length} agents
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <button
              key={a.slug}
              onClick={() => setSelected(a)}
              className="card group flex flex-col text-left transition hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-wider text-zinc-300">
                  {a.function}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wider",
                    a.engineHint === "Custom"
                      ? "border-helix-400/30 bg-helix-500/10 text-helix-200"
                      : a.engineHint === "Private"
                        ? "border-plasma-400/30 bg-plasma-500/10 text-plasma-200"
                        : "border-white/10 bg-white/5 text-zinc-300"
                  )}
                >
                  {a.engineHint}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">{a.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{a.short}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
                <span>{a.specialty} · {a.audience}</span>
                <span className="inline-flex items-center gap-1 text-helix-300">
                  Details <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card mt-8 p-10 text-center text-sm text-zinc-400">
            No agents match those filters. Try clearing them.
          </div>
        )}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="card w-full max-w-2xl overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-helix-300">
                  {selected.function} · {selected.engineHint}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                  {selected.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {selected.specialty} · {selected.audience}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-md border border-white/10 p-1.5 text-zinc-300 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-6 p-6">
              <p className="text-sm text-zinc-300">{selected.short}</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Inputs
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
                    {selected.inputs.map((i) => <li key={i}>· {i}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    Outputs
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-zinc-300">
                    {selected.outputs.map((i) => <li key={i}>· {i}</li>)}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/demo" className="btn-primary">
                  Request this agent <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/platform" className="btn-ghost">
                  See platform
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-sm text-white focus:border-helix-400/40 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-ink-900">
          {o}
        </option>
      ))}
    </select>
  );
}
