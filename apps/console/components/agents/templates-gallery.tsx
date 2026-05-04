"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { AgentForm, type AgentFormInitial } from "@/components/agents/agent-form";
import { cn } from "@/lib/cn";
import type { AgentTemplate, DocumentRow } from "@/lib/types";

const FUNCTION_TONE: Record<string, string> = {
  "Q&A": "border-helix-400/40 bg-helix-400/10 text-helix-200",
  Summarization: "border-plasma-400/40 bg-plasma-400/10 text-plasma-200",
  Drafting: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  Triage: "border-red-400/40 bg-red-400/10 text-red-200",
  Extraction: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  Monitoring: "border-violet-400/40 bg-violet-400/10 text-violet-200"
};

export function TemplatesGallery({
  templates,
  documents
}: {
  templates: AgentTemplate[];
  documents: DocumentRow[];
}) {
  const [picked, setPicked] = useState<AgentTemplate | null>(null);

  if (templates.length === 0) return null;

  function templateToInitial(t: AgentTemplate): AgentFormInitial {
    return {
      name: t.name,
      description: t.short,
      system_prompt_addendum: t.system_prompt_addendum,
      preferred_model: t.preferred_model,
      document_ids: []
    };
  }

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-helix-300" />
        <h2 className="text-sm font-semibold text-white">Readymade agents</h2>
        <span className="text-xs text-zinc-500">— one click to spin up</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <article
            key={t.slug}
            className="group flex flex-col rounded-2xl border border-white/10 bg-ink-900/60 p-4 transition hover:border-helix-400/40 hover:bg-ink-800/60"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide",
                  FUNCTION_TONE[t.function] ??
                    "border-white/10 bg-white/5 text-zinc-300"
                )}
              >
                {t.function}
              </span>
              <span className="text-[11px] text-zinc-500">{t.specialty}</span>
            </div>

            <h3 className="text-sm font-semibold text-white">{t.name}</h3>
            <p className="mt-1 line-clamp-3 text-xs text-zinc-400">{t.short}</p>

            <p className="mt-3 text-[10px] uppercase tracking-wide text-zinc-600">
              For {t.audience}
            </p>

            <button
              type="button"
              onClick={() => setPicked(t)}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition group-hover:border-helix-400/40 group-hover:bg-helix-400/10 group-hover:text-helix-100"
            >
              Use this template
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </article>
        ))}
      </div>

      {picked ? (
        <AgentForm
          documents={documents}
          initial={templateToInitial(picked)}
          onClose={() => setPicked(null)}
        />
      ) : null}
    </section>
  );
}
