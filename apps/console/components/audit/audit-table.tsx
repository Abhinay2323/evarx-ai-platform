"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, RefreshCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { AuditLogEntry, AuditLogPage } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const ACTION_LABEL: Record<string, string> = {
  "chat.public": "Public chat",
  "chat.authenticated": "Chat",
  "document.upload": "Document upload",
  "document.delete": "Document delete"
};

const ACTION_TONE: Record<string, string> = {
  "chat.public": "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  "chat.authenticated": "border-helix-400/40 bg-helix-400/10 text-helix-200",
  "document.upload": "border-plasma-400/40 bg-plasma-400/10 text-plasma-200",
  "document.delete": "border-red-500/40 bg-red-500/10 text-red-300"
};

const SINCE_OPTIONS = [
  { value: "1", label: "Last 24 h" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "", label: "All time" }
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium"
  });
}

async function authedFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const supabase = createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Session expired. Refresh and try again.");
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
    signal
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function AuditTable() {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [sinceDays, setSinceDays] = useState<string>("7");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (actionFilter) params.set("action", actionFilter);
    if (sinceDays) params.set("since_days", sinceDays);
    return params.toString();
  }, [actionFilter, sinceDays]);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const page = await authedFetch<AuditLogPage>(
          `/v1/audit-logs?${queryString}`,
          signal
        );
        setItems(page.items);
        setCursor(page.next_cursor);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [queryString]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    void refresh(ctrl.signal);
    return () => ctrl.abort();
  }, [refresh]);

  useEffect(() => {
    void authedFetch<string[]>("/v1/audit-logs/actions").then(setActions).catch(() => {});
  }, []);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50", before_created_at: cursor });
      if (actionFilter) params.set("action", actionFilter);
      if (sinceDays) params.set("since_days", sinceDays);
      const page = await authedFetch<AuditLogPage>(`/v1/audit-logs?${params.toString()}`);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.next_cursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-4">
        <FilterSelect
          label="Action"
          value={actionFilter}
          onChange={setActionFilter}
          options={[
            { value: "", label: "All actions" },
            ...actions.map((a) => ({ value: a, label: ACTION_LABEL[a] ?? a }))
          ]}
        />
        <FilterSelect
          label="Window"
          value={sinceDays}
          onChange={setSinceDays}
          options={SINCE_OPTIONS}
        />
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="h-3.5 w-3.5" />
          )}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="w-8 px-3 py-3" />
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Actor</th>
              <th className="px-4 py-3 text-left font-medium">Resource</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">
                  No audit entries match the current filters.
                </td>
              </tr>
            ) : null}

            {items.map((entry) => {
              const isOpen = expanded.has(entry.id);
              const tone = ACTION_TONE[entry.action] ?? "border-white/10 bg-white/5 text-zinc-300";
              return (
                <Row
                  key={entry.id}
                  entry={entry}
                  tone={tone}
                  open={isOpen}
                  onToggle={() => toggle(entry.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {cursor ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Load older entries
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  entry,
  tone,
  open,
  onToggle
}: {
  entry: AuditLogEntry;
  tone: string;
  open: boolean;
  onToggle: () => void;
}) {
  const hasMeta = entry.meta && Object.keys(entry.meta).length > 0;

  return (
    <>
      <tr className="text-zinc-200">
        <td className="px-3 py-3 align-top">
          {hasMeta ? (
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
              aria-label={open ? "Collapse" : "Expand"}
            >
              {open ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
              tone
            )}
          >
            {ACTION_LABEL[entry.action] ?? entry.action}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-zinc-300">
          {entry.user_email ?? <span className="text-zinc-600">—</span>}
        </td>
        <td className="px-4 py-3 text-xs">
          {entry.resource ? (
            <span className="font-mono text-zinc-400" title={entry.resource}>
              {entry.resource.slice(0, 8)}…
            </span>
          ) : (
            <span className="text-zinc-600">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-zinc-400">
          {entry.status_code ?? <span className="text-zinc-600">—</span>}
        </td>
        <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(entry.created_at)}</td>
      </tr>
      {open && hasMeta ? (
        <tr className="bg-ink-800/40">
          <td colSpan={6} className="px-12 py-3">
            <pre className="overflow-x-auto rounded-lg border border-white/5 bg-ink-950/60 p-3 text-[11px] text-zinc-400">
              {JSON.stringify(entry.meta, null, 2)}
            </pre>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-ink-800/60 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-helix-400/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
