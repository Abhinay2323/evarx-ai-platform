import { Bot } from "lucide-react";

import { AgentsList } from "@/components/agents/agents-list";
import { TemplatesGallery } from "@/components/agents/templates-gallery";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Workspace"
        title="Agents"
        icon={<Bot className="h-5 w-5" />}
        description="Pick a readymade template or build your own. Each agent has its own document scope, preferred model, and system instructions."
      />

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
    </div>
  );
}
