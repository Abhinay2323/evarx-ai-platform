import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AgentsList } from "@/components/agents/agents-list";
import { TemplatesGallery } from "@/components/agents/templates-gallery";
import { serverFetch } from "@/lib/server-fetch";
import type { AgentRow, AgentTemplate, DocumentRow } from "@/lib/types";

export const metadata = { title: "Agents · Evarx Console" };
export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  let agents: AgentRow[] = [];
  let documents: DocumentRow[] = [];
  let templates: AgentTemplate[] = [];
  let error: string | null = null;
  try {
    [agents, documents, templates] = await Promise.all([
      serverFetch<AgentRow[]>("/v1/agents"),
      serverFetch<DocumentRow[]>("/v1/documents"),
      serverFetch<AgentTemplate[]>("/v1/agent-templates")
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load agents";
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
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Agents</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Pick a readymade template or build your own. Each agent has its own
              document scope, preferred model, and system instructions.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="space-y-10">
            <TemplatesGallery templates={templates} documents={documents} />

            <section>
              <h2 className="mb-3 text-sm font-semibold text-white">Your agents</h2>
              <AgentsList initial={agents} documents={documents} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
