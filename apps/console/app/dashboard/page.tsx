import {
  Bot,
  Cpu,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { serverFetch } from "@/lib/server-fetch";
import { createClient } from "@/lib/supabase/server";
import type { Identity, MemberRow, UsageSummary } from "@/lib/types";

export const metadata = { title: "Dashboard · Evarx Console" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let identity: Identity | null = null;
  let summary: UsageSummary | null = null;
  let memberCount: number | null = null;

  try {
    [identity, summary] = await Promise.all([
      serverFetch<Identity>("/v1/me"),
      serverFetch<UsageSummary>("/v1/usage/summary")
    ]);
  } catch {
    /* dashboard renders even if API is briefly unavailable */
  }

  try {
    const members = await serverFetch<MemberRow[]>("/v1/orgs/me/members");
    memberCount = members.length;
  } catch {
    memberCount = null;
  }

  const greetName =
    identity?.user_id && user?.email ? user.email.split("@")[0] : user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-display font-bold text-white">
            Evarx Console
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <span className="hidden sm:inline">{user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            {identity?.org.name ? identity.org.name : "Welcome"}
          </p>
          <h1 className="mt-1 text-2xl font-display font-bold text-white">
            Welcome back{greetName ? `, ${greetName}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Pick a readymade agent, ground a question in your docs, or wire your
            org for production.
          </p>
        </div>

        <div className="mb-10">
          <KpiStrip summary={summary} memberCount={memberCount} />
        </div>

        <h2 className="mb-3 text-sm font-semibold text-zinc-300">Workspace</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LiveCard
            href="/chat"
            icon={<MessageSquareText className="h-5 w-5" />}
            title="Chat"
            desc="Ask questions over your private documents — answers cited from source chunks."
            tone="helix"
          />
          <LiveCard
            href="/agents"
            icon={<Bot className="h-5 w-5" />}
            title="Agents"
            desc="12 readymade specialty agents — protocol summarizer, ICSR triage, regulatory Q&A, more."
            tone="plasma"
          />
          <LiveCard
            href="/documents"
            icon={<FileText className="h-5 w-5" />}
            title="Documents"
            desc="Upload protocols, SOPs, regulatory docs. Indexed automatically for retrieval."
            tone="helix"
          />
        </div>

        <h2 className="mb-3 mt-10 text-sm font-semibold text-zinc-300">Platform</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LiveCard
            href="/models"
            icon={<Sparkles className="h-5 w-5" />}
            title="Models"
            desc="Cloud Standard for breadth, edge Medical for DPDP-bound deployments."
            tone="plasma"
          />
          <WipCard
            href="/finetuning"
            icon={<Cpu className="h-5 w-5" />}
            title="Fine-tuning"
            desc="Train your own medical SLM on your corpus. Currently invite-only."
          />
          <LiveCard
            href="/audit"
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Audit log"
            desc="DPDP-grade audit trail of every chat, upload, and delete."
            tone="helix"
          />
          <LiveCard
            href="/members"
            icon={<Settings2 className="h-5 w-5" />}
            title="Members"
            desc="Invite teammates, manage roles, see who has access."
            tone="helix"
          />
          <LiveCard
            href="/usage"
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Usage"
            desc="Documents indexed, queries this month, daily activity."
            tone="plasma"
          />
        </div>
      </main>
    </div>
  );
}

function LiveCard({
  href,
  icon,
  title,
  desc,
  tone
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: "helix" | "plasma";
}) {
  const accent = tone === "helix" ? "text-helix-300" : "text-plasma-300";
  const hoverBorder =
    tone === "helix" ? "hover:border-helix-400/40" : "hover:border-plasma-400/40";

  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-white/10 bg-ink-900/60 p-5 transition ${hoverBorder} hover:bg-ink-800/60`}
    >
      <div className={`flex items-center gap-3 ${accent}`}>
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{desc}</p>
      <p className="mt-4 inline-flex items-center text-[11px] text-zinc-500 group-hover:text-zinc-300">
        Open →
      </p>
    </Link>
  );
}

function WipCard({
  href,
  icon,
  title,
  desc
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 transition hover:border-amber-400/40"
    >
      <div className="flex items-center gap-3 text-amber-200">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="ml-auto rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] uppercase tracking-wide text-amber-200">
          WIP
        </span>
      </div>
      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{desc}</p>
      <p className="mt-4 inline-flex items-center text-[11px] text-zinc-500 group-hover:text-amber-200">
        Roadmap →
      </p>
    </Link>
  );
}
