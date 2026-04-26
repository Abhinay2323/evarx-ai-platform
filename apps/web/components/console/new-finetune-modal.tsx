"use client";

import { useState } from "react";
import { useConsole } from "@/lib/console-store";
import { Modal, Field, inputClass } from "@/components/console/modal";

const BASE_MODELS = ["evarx-med-1b", "evarx-med-3b", "evarx-med-7b"];

export function NewFinetuneModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { dispatch } = useConsole();
  const [name, setName] = useState("");
  const [base, setBase] = useState(BASE_MODELS[1]);
  const [dataset, setDataset] = useState("");
  const [errors, setErrors] = useState<{ name?: string; dataset?: string }>({});

  function reset() {
    setName("");
    setBase(BASE_MODELS[1]);
    setDataset("");
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim() || name.trim().length < 3) next.name = "Give the job a name (≥ 3 chars).";
    if (!dataset.trim()) next.dataset = "Pick a dataset to fine-tune on.";
    setErrors(next);
    if (Object.keys(next).length) return;

    dispatch({
      type: "ADD_FINETUNE",
      job: { name: name.trim(), base, dataset: dataset.trim() },
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
      title="New fine-tune job"
      description="Queue a fine-tune run on one of the Evarx-Med base models."
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
            form="finetune-form"
            className="rounded-lg bg-helix-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-helix-400"
          >
            Queue job
          </button>
        </>
      }
    >
      <form id="finetune-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="Job name" error={errors.name}>
          <input
            className={inputClass}
            placeholder="e.g. cardio-onco-v4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Base model">
          <select
            className={inputClass}
            value={base}
            onChange={(e) => setBase(e.target.value)}
          >
            {BASE_MODELS.map((m) => (
              <option key={m} value={m} className="bg-ink-900">
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Dataset"
          hint="Path or ID inside your tenant's data sources."
          error={errors.dataset}
        >
          <input
            className={inputClass}
            placeholder="s3://acme-vpc/datasets/cardio-2026q1"
            value={dataset}
            onChange={(e) => setDataset(e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
