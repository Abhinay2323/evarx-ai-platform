import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { LayoutDashboard, MessageSquareText, FileText, ShieldCheck, Settings2 } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard · Evarx Console" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
          <h1 className="text-2xl font-display font-bold text-white">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Phase 2.1 — auth is live. Document upload, RAG chat, and audit logs land next.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card icon={<MessageSquareText className="h-5 w-5" />} title="Agents" desc="Conversational agents over your private documents." status="Coming in 2.2" />
          <Card icon={<FileText className="h-5 w-5" />} title="Documents" desc="Upload protocols, SOPs, regulatory docs." status="Coming in 2.2" />
          <Card icon={<ShieldCheck className="h-5 w-5" />} title="Audit log" desc="DPDP-grade audit trail of every chat." status="Coming in 2.3" />
          <Card icon={<Settings2 className="h-5 w-5" />} title="Org settings" desc="Members, billing, deployment keys." status="Coming in 2.3" />
          <Card icon={<LayoutDashboard className="h-5 w-5" />} title="Usage" desc="Token spend, doc count, query volume." status="Coming in 2.3" />
        </div>
      </main>
    </div>
  );
}

function Card({ icon, title, desc, status }: { icon: React.ReactNode; title: string; desc: string; status: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <div className="flex items-center gap-3 text-helix-300">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{desc}</p>
      <p className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
        {status}
      </p>
    </div>
  );
}
