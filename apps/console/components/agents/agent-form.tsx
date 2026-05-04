"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { AgentRow, DocumentRow } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const schema = z.object({
  name: z.string().min(1, "Required").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  system_prompt_addendum: z.string().max(4000).optional().or(z.literal(""))
});

type FormValues = z.infer<typeof schema>;

interface Props {
  documents: DocumentRow[];
  initial?: AgentRow;
  onClose: () => void;
}

export function AgentForm({ documents, initial, onClose }: Props) {
  const router = useRouter();
  const [docIds, setDocIds] = useState<Set<string>>(
    new Set(initial?.document_ids ?? [])
  );
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      system_prompt_addendum: initial?.system_prompt_addendum ?? ""
    }
  });

  function toggleDoc(id: string) {
    setDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        setServerError("Session expired. Refresh and try again.");
        return;
      }
      const body = {
        name: values.name,
        description: values.description || null,
        system_prompt_addendum: values.system_prompt_addendum || null,
        document_ids: Array.from(docIds)
      };
      const url = initial ? `${BASE}/v1/agents/${initial.id}` : `${BASE}/v1/agents`;
      const res = await fetch(url, {
        method: initial ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setServerError(detail || `Save failed (${res.status})`);
        return;
      }
      router.refresh();
      onClose();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Save failed");
    }
  }

  const readyDocs = documents.filter((d) => d.status === "ready");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-display font-semibold text-white">
          {initial ? "Edit agent" : "New agent"}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Agents are named retrieval scopes. Pick a name, an optional system
          instruction, and which documents the agent can search.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Name" error={errors.name?.message}>
            <input
              type="text"
              placeholder="Pharmacovigilance assistant"
              {...register("name")}
              className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-helix-400/40"
            />
          </Field>

          <Field label="Description (optional)" error={errors.description?.message}>
            <input
              type="text"
              placeholder="Routes adverse-event questions to PV SOPs only."
              {...register("description")}
              className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-helix-400/40"
            />
          </Field>

          <Field
            label="System instructions (optional)"
            error={errors.system_prompt_addendum?.message}
            hint="Appended to the base RAG prompt. E.g. 'Always reference the source SOP version.'"
          >
            <textarea
              rows={3}
              placeholder="Always quote the SOP version and section number when relevant."
              {...register("system_prompt_addendum")}
              className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-helix-400/40"
            />
          </Field>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Documents in scope ({docIds.size} selected)
            </label>
            <p className="mb-2 text-[11px] text-zinc-500">
              Only ready documents appear. An empty selection disables retrieval —
              the agent will tell users to upload first.
            </p>
            {readyDocs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 bg-ink-800/40 px-3 py-4 text-center text-xs text-zinc-500">
                No ready documents in this org yet. Upload some on the Documents page first.
              </p>
            ) : (
              <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-ink-800/40 p-2">
                {readyDocs.map((d) => (
                  <label
                    key={d.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition",
                      docIds.has(d.id)
                        ? "bg-helix-400/10 text-helix-100"
                        : "text-zinc-300 hover:bg-white/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={docIds.has(d.id)}
                      onChange={() => toggleDoc(d.id)}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-ink-900 text-helix-400 focus:ring-helix-400/40"
                    />
                    <span className="flex-1 truncate">{d.filename}</span>
                    <span className="text-[10px] text-zinc-600">{d.chunk_count} chunks</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {serverError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {serverError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-110",
                isSubmitting && "pointer-events-none opacity-70"
              )}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {initial ? "Save changes" : "Create agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-300">{label}</span>
      {hint ? <p className="mb-1.5 text-[11px] text-zinc-500">{hint}</p> : null}
      {children}
      {error ? <span className="mt-1 block text-[11px] text-red-400">{error}</span> : null}
    </label>
  );
}
