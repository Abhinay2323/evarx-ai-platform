import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AuditTable } from "@/components/audit/audit-table";

export const metadata = { title: "Audit log · Evarx Console" };
export const dynamic = "force-dynamic";

export default function AuditPage() {
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
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Audit log</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Append-only record of every action your org performs in Evarx. Bodies
              are hashed, never stored. Use this for DPDP compliance and incident
              review.
            </p>
          </div>
        </div>

        <AuditTable />
      </main>
    </div>
  );
}
