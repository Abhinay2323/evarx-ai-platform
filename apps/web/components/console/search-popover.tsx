"use client";

import Link from "next/link";
import { Bot, Workflow, Cpu, Search as SearchIcon } from "lucide-react";
import { useConsole } from "@/lib/console-store";

interface SearchPopoverProps {
  open: boolean;
  query: string;
  onSelect: () => void;
}

/**
 * Type-ahead results across agents, workflows, and fine-tune jobs.
 * Pure client filter — when wiring to the real backend, swap the in-memory
 * filter for a search endpoint.
 */
export function SearchPopover({ open, query, onSelect }: SearchPopoverProps) {
  const { state } = useConsole();
  const q = query.trim().toLowerCase();

  if (!open || q.length === 0) return null;

  const agents = state.agents
    .filter((a) => a.name.toLowerCase().includes(q) || a.function.toLowerCase().includes(q))
    .slice(0, 5);
  const workflows = state.workflows
    .filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.trigger.toLowerCase().includes(q),
    )
    .slice(0, 5);
  const finetune = state.finetuneJobs
    .filter(
      (f) =>
        f.id.toLowerCase().includes(q) ||
        f.base.toLowerCase().includes(q) ||
        f.stage.toLowerCase().includes(q),
    )
    .slice(0, 5);

  const empty =
    agents.length === 0 && workflows.length === 0 && finetune.length === 0;

  return (
    <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-ink-900/95 shadow-cell backdrop-blur">
      {empty ? (
        <div className="px-4 py-6 text-center text-sm text-zinc-500">
          <SearchIcon className="mx-auto mb-2 h-4 w-4 text-zinc-600" />
          No matches for &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto py-2">
          <ResultGroup
            label="Agents"
            icon={<Bot className="h-3.5 w-3.5" />}
            items={agents.map((a) => ({
              key: a.id,
              title: a.name,
              sub: a.function,
              href: "/console/agents",
            }))}
            onSelect={onSelect}
          />
          <ResultGroup
            label="Workflows"
            icon={<Workflow className="h-3.5 w-3.5" />}
            items={workflows.map((w) => ({
              key: w.id,
              title: w.name,
              sub: `${w.trigger} · ${w.runs} runs`,
              href: "/console/workflows",
            }))}
            onSelect={onSelect}
          />
          <ResultGroup
            label="Fine-tune jobs"
            icon={<Cpu className="h-3.5 w-3.5" />}
            items={finetune.map((f) => ({
              key: f.id,
              title: f.id,
              sub: `base ${f.base} · ${f.stage}`,
              href: "/console/models",
            }))}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  icon,
  items,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  items: { key: string; title: string; sub: string; href: string }[];
  onSelect: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="px-1 py-1">
      <p className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {icon}
        {label}
      </p>
      <ul>
        {items.map((it) => (
          <li key={it.key}>
            <Link
              href={it.href}
              onClick={onSelect}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
            >
              <span>
                <span className="block text-sm text-white">{it.title}</span>
                <span className="block text-[11px] text-zinc-500">{it.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
