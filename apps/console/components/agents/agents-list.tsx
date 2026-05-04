"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AgentForm } from "@/components/agents/agent-form";
import type { AgentRow, DocumentRow } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export function AgentsList({
  initial,
  documents
}: {
  initial: AgentRow[];
  documents: DocumentRow[];
}) {
  const router = useRouter();
  const [agents] = useState<AgentRow[]>(initial);
  const [editing, setEditing] = useState<AgentRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function onDelete(id: string, name: string) {
    if (!window.confirm(`Delete agent "${name}"? Conversations referencing it will keep working but lose the link.`)) {
      return;
    }
    setDeleting(id);
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${BASE}/v1/agents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 px-3 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          New agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/40 px-6 py-10 text-center">
          <Bot className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-300">No agents yet.</p>
          <p className="mt-1 text-xs text-zinc-500">
            Create one to scope chat retrieval to a specific document set.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {agents.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-white/10 bg-ink-900/60 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-helix-300">
                    <Bot className="h-4 w-4" />
                    <h3 className="truncate text-sm font-semibold text-white">
                      {a.name}
                    </h3>
                  </div>
                  {a.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                      {a.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(a)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(a.id, a.name)}
                    disabled={deleting === a.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    aria-label="Delete"
                  >
                    {deleting === a.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
                <FileText className="h-3 w-3" />
                {a.document_ids.length} document{a.document_ids.length === 1 ? "" : "s"} in scope
              </div>
            </div>
          ))}
        </div>
      )}

      {creating ? (
        <AgentForm documents={documents} onClose={() => setCreating(false)} />
      ) : null}
      {editing ? (
        <AgentForm
          documents={documents}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
