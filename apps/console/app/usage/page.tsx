import Link from "next/link";
import {
  ArrowLeft,
  Database,
  FileText,
  HardDrive,
  LayoutDashboard,
  MessageSquareText
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Sparkline } from "@/components/usage/sparkline";
import { serverFetch } from "@/lib/server-fetch";
import type { DailySeries, UsageSummary } from "@/lib/types";

export const metadata = { title: "Usage · Evarx Console" };
export const dynamic = "force-dynamic";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

export default async function UsagePage() {
  let summary: UsageSummary | null = null;
  let series: DailySeries | null = null;
  let error: string | null = null;
  try {
    [summary, series] = await Promise.all([
      serverFetch<UsageSummary>("/v1/usage/summary"),
      serverFetch<DailySeries>("/v1/usage/daily?days=30")
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load usage";
  }

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

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-xl border border-white/10 bg-helix-500/10 p-2 text-helix-300">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Usage</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Document and query volume for your org. Updates as soon as the audit
              log records activity.
            </p>
          </div>
        </div>

        {error || !summary || !series ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error ?? "Failed to load usage"}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<FileText className="h-4 w-4" />}
                label="Documents"
                value={fmtNum(summary.documents_total)}
                sub={`${fmtNum(summary.documents_ready)} ready`}
              />
              <KpiCard
                icon={<Database className="h-4 w-4" />}
                label="Chunks indexed"
                value={fmtNum(summary.chunks_total)}
                sub="Across all documents"
              />
              <KpiCard
                icon={<HardDrive className="h-4 w-4" />}
                label="Storage"
                value={formatBytes(summary.storage_bytes)}
                sub="In S3 (ap-south-1)"
              />
              <KpiCard
                icon={<MessageSquareText className="h-4 w-4" />}
                label="Queries this month"
                value={fmtNum(summary.queries_this_month)}
                sub={`${fmtNum(summary.queries_30d)} in last 30 days`}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/60 p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-white">Daily queries</h2>
                <span className="text-[11px] text-zinc-500">Last 30 days</span>
              </div>
              <Sparkline points={series.points} />
            </div>

            <p className="mt-6 text-xs text-zinc-600">
              Org created {new Date(summary.org_created_at).toLocaleDateString(undefined, { dateStyle: "long" })}.
              {" "}Total queries lifetime: {fmtNum(summary.queries_total)}.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-display font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}
