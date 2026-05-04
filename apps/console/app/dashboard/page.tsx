import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { Bot, LayoutDashboard, MessageSquareText, FileText, ShieldCheck, Settings2 } from "lucide-react";
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
            Upload documents on the Documents page, then ask questions over them in Chat.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LiveCard
            href="/chat"
            icon={<MessageSquareText className="h-5 w-5" />}
            title="Chat"
            desc="Ask questions over your private documents — answers cited from source chunks."
          />
          <LiveCard
            href="/agents"
            icon={<Bot className="h-5 w-5" />}
            title="Agents"
            desc="Named retrieval scopes — each agent has its own document set and instructions."
          />
          <LiveCard
            href="/documents"
            icon={<FileText className="h-5 w-5" />}
            title="Documents"
            desc="Upload protocols, SOPs, regulatory docs. Indexed automatically for retrieval."
          />
          <LiveCard
            href="/audit"
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Audit log"
            desc="DPDP-grade audit trail of every chat, upload, and delete."
          />
          <LiveCard
            href="/members"
            icon={<Settings2 className="h-5 w-5" />}
            title="Members"
            desc="Invite teammates, manage roles, see who has access."
          />
          <LiveCard
            href="/usage"
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Usage"
            desc="Documents indexed, queries this month, daily activity."
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
      className="group rounded-2xl border border-white/10 bg-ink-900/60 p-5 transition hover:border-helix-400/40 hover:bg-ink-800/60"
    >
      <div className="flex items-center gap-3 text-helix-300">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{desc}</p>
      <p className="mt-4 inline-flex items-center rounded-full border border-helix-400/40 bg-helix-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-helix-200">
        Open →
      </p>
    </Link>
  );
}

