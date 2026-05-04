import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  MessageSquareText,
  Users
} from "lucide-react";

import type { UsageSummary } from "@/lib/types";

interface Props {
  summary: UsageSummary | null;
  memberCount: number | null;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

export function KpiStrip({ summary, memberCount }: Props) {
  const tiles = [
    {
      icon: FileText,
      label: "Documents ready",
      value: summary ? fmt(summary.documents_ready) : "—",
      sub: summary
        ? `${fmt(summary.documents_total)} total · ${fmt(summary.chunks_total)} chunks`
        : "Loading…",
      href: "/documents"
    },
    {
      icon: MessageSquareText,
      label: "Queries this month",
      value: summary ? fmt(summary.queries_this_month) : "—",
      sub: summary
        ? `${fmt(summary.queries_30d)} in last 30 days`
        : "Loading…",
      href: "/usage"
    },
    {
      icon: Users,
      label: "Members",
      value: memberCount !== null ? fmt(memberCount) : "—",
      sub: "Active in this org",
      href: "/members"
    }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiles.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          className="group flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-4 transition hover:border-helix-400/40 hover:bg-ink-800/60"
        >
          <div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <t.icon className="h-3.5 w-3.5" />
              <span className="text-[11px] uppercase tracking-wide">{t.label}</span>
            </div>
            <p className="mt-1.5 font-display text-2xl font-semibold text-white">
              {t.value}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">{t.sub}</p>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 transition group-hover:text-helix-300" />
        </Link>
      ))}
    </div>
  );
}
