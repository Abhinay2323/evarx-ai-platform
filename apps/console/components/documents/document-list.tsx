"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { DocumentRow, DocumentStatus } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const STATUS_LABEL: Record<DocumentStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed"
};

const STATUS_TONE: Record<DocumentStatus, string> = {
  queued: "bg-white/5 text-zinc-300 border-white/10",
  processing: "bg-helix-400/10 text-helix-200 border-helix-400/30",
  ready: "bg-helix-500/15 text-helix-200 border-helix-400/40",
  failed: "bg-red-500/10 text-red-300 border-red-500/30"
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function DocumentList({ initial }: { initial: DocumentRow[] }) {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentRow[]>(initial);
  const [deleting, setDeleting] = useState<string | null>(null);

  const hasPending = docs.some((d) => d.status === "queued" || d.status === "processing");

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(`${BASE}/v1/documents`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store"
    });
    if (res.ok) {
      const fresh = (await res.json()) as DocumentRow[];
      setDocs(fresh);
    }
  }, []);

  useEffect(() => {
    setDocs(initial);
  }, [initial]);

  useEffect(() => {
    if (!hasPending) return;
    const interval = window.setInterval(() => {
      void refresh();
    }, 3000);
    return () => window.clearInterval(interval);
  }, [hasPending, refresh]);

  async function onDelete(id: string) {
    if (!window.confirm("Delete this document and all its embeddings?")) return;
    setDeleting(id);
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${BASE}/v1/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== id));
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  }

  if (docs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/40 px-6 py-10 text-center text-sm text-zinc-500">
        No documents yet. Upload one above to begin building your knowledge base.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Filename</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Chunks</th>
            <th className="px-4 py-3 text-left font-medium">Size</th>
            <th className="px-4 py-3 text-left font-medium">Uploaded</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {docs.map((doc) => (
            <tr key={doc.id} className="text-zinc-200">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span className="truncate" title={doc.filename}>
                    {doc.filename}
                  </span>
                </div>
                {doc.status === "failed" && doc.error ? (
                  <p className="mt-1 text-xs text-red-300/80">{doc.error}</p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs",
                    STATUS_TONE[doc.status]
                  )}
                >
                  {(doc.status === "queued" || doc.status === "processing") && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                  {STATUS_LABEL[doc.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-zinc-400">{doc.chunk_count}</td>
              <td className="px-4 py-3 text-zinc-400">{formatBytes(doc.size_bytes)}</td>
              <td className="px-4 py-3 text-zinc-400">{formatDate(doc.created_at)}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(doc.id)}
                  disabled={deleting === doc.id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  aria-label="Delete document"
                >
                  {deleting === doc.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
