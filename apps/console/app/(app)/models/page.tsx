import Link from "next/link";
import { Cloud, Cpu, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { serverFetch } from "@/lib/server-fetch";
import type { ModelInfo } from "@/lib/types";

export const metadata = { title: "Models · Evarx Console" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  Live: "border-helix-400/40 bg-helix-400/10 text-helix-200",
  "Stand-in": "border-amber-400/40 bg-amber-400/10 text-amber-200",
  "Coming soon": "border-white/10 bg-white/5 text-zinc-400"
};

export default async function ModelsPage() {
  let models: ModelInfo[] = [];
  let error: string | null = null;
  try {
    models = await serverFetch<ModelInfo[]>("/v1/models");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load models";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Platform"
        title="Models"
        icon={<Sparkles className="h-5 w-5" />}
        description="The model aliases routing requests for your org. Standard runs in the cloud; Medical is the on-edge SLM that powers our DPDP-bound deployments."
      />

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {models.map((m) => (
            <article
              key={m.id}
              className="rounded-2xl border border-white/10 bg-ink-900/60 p-6 transition hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    {m.kind === "cloud" ? (
                      <Cloud className="h-4 w-4 text-plasma-300" />
                    ) : (
                      <Cpu className="h-4 w-4 text-helix-300" />
                    )}
                    <span className="text-[11px] uppercase tracking-wider">
                      {m.kind === "cloud" ? "Cloud" : "Edge / On-prem"}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-display font-semibold text-white">
                    {m.label}
                  </h2>
                  <code className="text-[11px] font-mono text-zinc-500">
                    {m.id}
                  </code>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${
                    STATUS_TONE[m.status_label] ?? "border-white/10 text-zinc-300"
                  }`}
                >
                  {m.status_label}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                {m.description}
              </p>

              {m.recommended_for.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Recommended for
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                    {m.recommended_for.map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-helix-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {m.id === "evarx-medical" && m.status_label === "Stand-in" ? (
                <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[11px] text-amber-200/80">
                  The fine-tuned medical SLM is currently in training. Until it
                  deploys, this alias routes to Evarx Standard so the rest of the
                  platform stays functional. See{" "}
                  <Link href="/finetuning" className="underline">
                    Fine-tuning
                  </Link>{" "}
                  for the roadmap.
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
