"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useConsole } from "@/lib/console-store";
import { KpiCard } from "@/components/console/kpi-card";
import { UsageChart } from "@/components/console/usage-chart";
import { AgentsTable } from "@/components/console/agents-table";
import { FinetunePanel } from "@/components/console/finetune-panel";
import { ActivityFeed } from "@/components/console/activity-feed";
import { DataSources } from "@/components/console/data-sources";

export default function ConsoleDashboard() {
  const {
    state: { tenant, kpis },
  } = useConsole();

  // Greet on first name (fall back to full name).
  const firstName = tenant.user.name.split(" ")[1] ?? tenant.user.name;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-helix-300">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {tenant.plan} · {tenant.region}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-full border border-helix-400/30 bg-helix-500/10 px-3 py-1.5 text-xs font-medium text-helix-200 hover:bg-helix-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get this for your team
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <UsageChart />
          <AgentsTable />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <FinetunePanel />
          <ActivityFeed />
          <DataSources />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-plasma-500/10 via-transparent to-helix-500/10 p-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          About this preview
        </p>
        <p className="mt-3 text-sm text-zinc-300">
          This is a live preview of the Evarx customer console — the same
          surface real tenants see, populated with their own workflows, agents,
          and fine-tune jobs, isolated to their region and DPDP-compliant by
          default. Search, notifications, and the &ldquo;new job / add agent /
          new workflow&rdquo; actions all work; your changes persist locally
          until you reset the demo from the user menu.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-full bg-helix-500 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-helix-400"
          >
            Book a demo <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/platform"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.06]"
          >
            See the platform
          </Link>
        </div>
      </div>
    </div>
  );
}
