"use client";

import { useState } from "react";
import { useConsole } from "@/lib/console-store";
import { Modal, Field, inputClass } from "@/components/console/modal";

const FUNCTIONS = [
  "Q&A",
  "Triage",
  "Summarization",
  "Extraction",
  "Classification",
  "Routing",
];

export function NewAgentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { dispatch } = useConsole();
  const [name, setName] = useState("");
  const [fn, setFn] = useState(FUNCTIONS[0]);
  const [domain, setDomain] = useState("");
  const [errors, setErrors] = useState<{ name?: string; domain?: string }>({});

  function reset() {
    setName("");
    setFn(FUNCTIONS[0]);
    setDomain("");
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim() || name.trim().length < 3)
      next.name = "Agent name must be at least 3 characters.";
    if (!domain.trim()) next.domain = "Pick a clinical or business domain.";
    setErrors(next);
    if (Object.keys(next).length) return;

    dispatch({
      type: "ADD_AGENT",
      agent: {
        name: name.trim(),
        function: `${fn} · ${domain.trim()}`,
        runs: 0,
        avgMs: 0,
        accuracy: 0,
        status: "watch",
      },
    });
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add agent"
      description="Define a new agent. It'll be created in 'watch' status until first run completes."
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="agent-form"
            className="rounded-lg bg-helix-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-helix-400"
          >
            Create agent
          </button>
        </>
      }
    >
      <form id="agent-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Agent name" error={errors.name}>
          <input
            className={inputClass}
            placeholder="e.g. Oncology trial summarizer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Function">
          <select
            className={inputClass}
            value={fn}
            onChange={(e) => setFn(e.target.value)}
          >
            {FUNCTIONS.map((f) => (
              <option key={f} value={f} className="bg-ink-900">
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Domain"
          hint="The clinical or business area this agent specialises in."
          error={errors.domain}
        >
          <input
            className={inputClass}
            placeholder="e.g. Oncology, Pharmacovigilance, Legal"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
