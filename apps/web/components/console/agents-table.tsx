"use client";

import { useConsole } from "@/lib/console-store";
import { cn } from "@/lib/cn";

interface AgentsTableProps {
  /** Show all agents instead of the top-5 dashboard slice. */
  showAll?: boolean;
  /** Optional title override (default: "Active agents"). */
  title?: string;
  /** Hide the surrounding card chrome — for embedding. */
  bare?: boolean;
}

export function AgentsTable({
  showAll = false,
  title = "Active agents",
  bare = false,
}: AgentsTableProps) {
  const {
    state: { agents, search },
  } = useConsole();

  // Apply global search if anything is typed in the topbar.
  const q = search.trim().toLowerCase();
  const filtered = q
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.function.toLowerCase().includes(q),
      )
    : agents;

  const rows = showAll ? filtered : filtered.slice(0, 5);

  const wrapperCls = bare
    ? ""
    : "rounded-2xl border border-white/10 bg-white/[0.02]";

  return (
    <div className={wrapperCls}>
      {!bare ? (
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {showAll
                ? `${filtered.length} agent${filtered.length === 1 ? "" : "s"}${q ? ` matching "${search}"` : ""}`
                : "Top 5 by run volume"}
            </p>
          </div>
        </header>
      ) : null}

      <table className="w-full text-sm">
        <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-5 py-3 text-left font-medium">Agent</th>
            <th className="px-5 py-3 text-right font-medium">Runs · 7d</th>
            <th className="px-5 py-3 text-right font-medium">Avg ms</th>
            <th className="px-5 py-3 text-right font-medium">Accuracy</th>
            <th className="px-5 py-3 text-right font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-5 py-8 text-center text-sm text-zinc-500"
              >
                {q ? `No agents match "${search}".` : "No agents yet."}
              </td>
            </tr>
          ) : (
            rows.map((a) => (
              <tr key={a.id} className="text-zinc-300">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-white">{a.name}</p>
                  <p className="text-[11px] text-zinc-500">{a.function}</p>
                </td>
                <td className="px-5 py-3.5 text-right font-mono">
                  {a.runs.toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3.5 text-right font-mono">
                  {a.avgMs || "—"}
                </td>
                <td className="px-5 py-3.5 text-right font-mono">
                  {a.accuracy ? `${(a.accuracy * 100).toFixed(0)}%` : "—"}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      a.status === "healthy"
                        ? "border-helix-400/30 bg-helix-500/10 text-helix-200"
                        : "border-amber-400/30 bg-amber-500/10 text-amber-200",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        a.status === "healthy"
                          ? "bg-helix-400"
                          : "bg-amber-400",
                      )}
                    />
                    {a.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
