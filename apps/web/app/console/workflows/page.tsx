"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { WorkflowsTable } from "@/components/console/workflows-table";
import { NewWorkflowModal } from "@/components/console/new-workflow-modal";

export default function WorkflowsPage() {
  const [openNew, setOpenNew] = useState(false);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Workflows
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Triggered pipelines that orchestrate one or more agents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenNew(true)}
          className="inline-flex items-center gap-1.5 self-start rounded-full bg-helix-500 px-4 py-2 text-xs font-medium text-ink-950 hover:bg-helix-400"
        >
          <Plus className="h-3.5 w-3.5" />
          New workflow
        </button>
      </header>

      <WorkflowsTable />

      <NewWorkflowModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
