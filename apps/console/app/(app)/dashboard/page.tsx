import {
  Bot,
  Cpu,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";

import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { PageHeader } from "@/components/layout/page-header";
import { serverFetch } from "@/lib/server-fetch";
import type { Identity, MemberRow, UsageSummary } from "@/lib/types";

export const metadata = { title: "Dashboard · Evarx Console" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let identity: Identity | null = null;
  let summary: UsageSummary | null = null;
  let memberCount: number | null = null;

  try {
    [identity, summary] = await Promise.all([
      serverFetch<Identity>("/v1/me"),
      serverFetch<UsageSummary>("/v1/usage/summary")
    ]);
  } catch {
    /* ignored */
  }
  try {
    const members = await serverFetch<MemberRow[]>("/v1/orgs/me/members");
    memberCount = members.length;
  } catch {
    memberCount = null;
  }

  const greeting = identity?.email?.split("@")[0] ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow={identity?.org?.name ?? "Workspace"}
        title={greeting ? `Welcome back, ${greeting}.` : "Welcome to Evarx."}
        description="Pick a readymade agent, ground a question in your docs, or wire your org for production."
      />

      <div className="mb-10">
        <KpiStrip summary={summary} memberCount={memberCount} />
      </div>

      <SectionTitle>Workspace</SectionTitle>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          href="/chat"
          icon={MessageSquareText}
          title="Chat"
          desc="Ask questions over your private documents — answers cited from source chunks."
          tone="helix"
        />
        <FeatureCard
          href="/agents"
          icon={Bot}
          title="Agents"
          desc="12 readymade specialty agents — protocol summarizer, ICSR triage, regulatory Q&A, more."
          tone="plasma"
        />
        <FeatureCard
          href="/documents"
          icon={FileText}
          title="Documents"
          desc="Upload protocols, SOPs, regulatory docs. Indexed automatically for retrieval."
          tone="helix"
        />
      </div>

      <SectionTitle>Platform</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          href="/models"
          icon={Sparkles}
          title="Models"
          desc="Cloud Standard for breadth, edge Medical for DPDP-bound deployments."
          tone="plasma"
        />
        <FeatureCard
          href="/finetuning"
          icon={Cpu}
          title="Fine-tuning"
          desc="Train your own medical SLM on your corpus. Currently invite-only."
          tone="amber"
          wip
        />
        <FeatureCard
          href="/audit"
          icon={ShieldCheck}
          title="Audit log"
          desc="DPDP-grade audit trail of every chat, upload, and delete."
          tone="helix"
        />
        <FeatureCard
          href="/members"
          icon={Settings2}
          title="Members"
          desc="Invite teammates, manage roles, see who has access."
          tone="helix"
        />
        <FeatureCard
          href="/usage"
          icon={LayoutDashboard}
          title="Usage"
          desc="Documents indexed, queries this month, daily activity."
          tone="plasma"
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </h2>
  );
}

function FeatureCard({
  href,
  icon: Icon,
  title,
  desc,
  tone,
  wip = false
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tone: "helix" | "plasma" | "amber";
  wip?: boolean;
}) {
  const tones = {
    helix: {
      iconBg: "from-helix-500/15 to-helix-500/5",
      iconColor: "text-helix-300",
      hoverBorder: "hover:border-helix-400/40"
    },
    plasma: {
      iconBg: "from-plasma-500/15 to-plasma-500/5",
      iconColor: "text-plasma-300",
      hoverBorder: "hover:border-plasma-400/40"
    },
    amber: {
      iconBg: "from-amber-500/15 to-amber-500/5",
      iconColor: "text-amber-200",
      hoverBorder: "hover:border-amber-400/40"
    }
  } as const;
  const t = tones[tone];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 p-5 transition ${t.hoverBorder} hover:bg-ink-800/60`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl border border-white/10 bg-gradient-to-br ${t.iconBg} ${t.iconColor} p-2`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {wip ? (
          <span className="ml-auto rounded-full border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-200">
            WIP
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-xs text-zinc-400 leading-relaxed">{desc}</p>
      <p className="mt-4 inline-flex items-center text-[11px] text-zinc-500 transition group-hover:text-zinc-300">
        Open →
      </p>
    </Link>
  );
}
