"use client";

import { useState } from "react";
import { useConsole } from "@/lib/console-store";
import { Modal, Field, inputClass } from "@/components/console/modal";

const TRIGGERS = [
  "Inbox · sentinel",
  "Webhook · approval API",
  "Slack · #channel",
  "Cron · daily",
  "Cron · hourly",
  "Manual",
];

export function NewWorkflowModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useConsole();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [agents, setAgents] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; agents?: string }>({});

  function toggleAgent(name: string) {
    setAgents((curr) =>
      curr.includes(name) ? curr.filter((a) => a !== name) : [...curr, name],
    );
  }

  function reset() {
    setName("");
    setDescription("");
    setTrigger(TRIGGERS[0]);
    setAgents([]);
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim() || name.trim().length < 3)
      next.name = "Workflow name must be at least 3 characters.";
    if (agents.length === 0) next.agents = "Select at least one agent.";
    setErrors(next);
    if (Object.keys(next).length) return;

    dispatch({
      type: "ADD_WORKFLOW",
      workflow: {
        name: name.trim(),
        description: description.trim() || "—",
        trigger,
        agents,
      },
    });
    reset();
    onClose();
  }

  return (
    <Modal
      size="lg"
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New workflow"
      description="Wire one or more agents to a trigger. The workflow becomes active immediately."
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
            form="workflow-form"
            className="rounded-lg bg-helix-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-helix-400"
          >
            Create workflow
          </button>
        </>
      }
    >
      <form id="workflow-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Workflow name" error={errors.name}>
          <input
            className={inputClass}
            placeholder="e.g. Pharmacovigilance triage"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Description" hint="Short summary your team will see in the dashboard.">
          <textarea
            rows={2}
            className={inputClass}
            placeholder="What this workflow does, who it's for."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field label="Trigger">
          <select
            className={inputClass}
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
          >
            {TRIGGERS.map((t) => (
              <option key={t} value={t} className="bg-ink-900">
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Agents"
          hint="Select one or more agents this workflow will invoke."
          error={errors.agents}
        >
          <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2 sm:grid-cols-2">
            {state.agents.map((a) => {
              const checked = agents.includes(a.name);
              return (
                <label
                  key={a.id}
                  className={
                    "flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-xs transition " +
                    (checked
                      ? "border-helix-400/40 bg-helix-500/10 text-helix-100"
                      : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20")
                  }
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAgent(a.name)}
                    className="mt-0.5 h-3.5 w-3.5 accent-helix-500"
                  />
                  <span>
                    <span className="block font-medium">{a.name}</span>
                    <span className="text-[11px] text-zinc-500">{a.function}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
