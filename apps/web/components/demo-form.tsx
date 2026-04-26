"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { leadSchema, type LeadInput } from "@/lib/lead-schema";
import { cn } from "@/lib/cn";

const steps = [
  { key: "you", label: "About you" },
  { key: "company", label: "Your team" },
  { key: "scope", label: "What you need" }
] as const;

type StepKey = (typeof steps)[number]["key"];

const fieldsByStep: Record<StepKey, (keyof LeadInput)[]> = {
  you: ["fullName", "workEmail"],
  company: ["company", "role", "teamSize"],
  scope: ["interest", "useCase", "consent"]
};

export function DemoForm() {
  const [stepIdx, setStepIdx] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      workEmail: "",
      company: "",
      role: "R&D / Discovery",
      teamSize: "11-50",
      interest: "Not sure yet",
      useCase: "",
      consent: false
    }
  });

  const step = steps[stepIdx].key;

  async function onNext() {
    const ok = await trigger(fieldsByStep[step]);
    if (ok) setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  }

  async function onSubmit(values: LeadInput) {
    setServerError(null);
    try {
      const res = await fetch("https://formsubmit.co/ajax/contact@evarx.in", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Evarx demo request — ${values.company}`,
          _template: "table",
          _captcha: "false",
          name: values.fullName,
          work_email: values.workEmail,
          company: values.company,
          role: values.role,
          team_size: values.teamSize,
          engine_of_interest: values.interest,
          workflow: values.useCase,
          consent: values.consent ? "yes" : "no",
          submitted_at: new Date().toISOString()
        })
      });
      const data: { success?: boolean | string; message?: string } = await res
        .json()
        .catch(() => ({}));
      const ok = res.ok && (data.success === true || data.success === "true");
      if (!ok) throw new Error(data.message ?? `Request failed (${res.status})`);
      setSubmitted(true);
    } catch (e: unknown) {
      const subject = `Evarx demo request — ${values.company}`;
      const body =
        `Name: ${values.fullName}\n` +
        `Work email: ${values.workEmail}\n` +
        `Company: ${values.company}\n` +
        `Role: ${values.role}\n` +
        `Team size: ${values.teamSize}\n` +
        `Engine of interest: ${values.interest}\n\n` +
        `Workflow:\n${values.useCase}\n\n` +
        `Consent to be contacted: ${values.consent ? "yes" : "no"}`;
      window.location.href = `mailto:contact@evarx.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-helix-500/15 text-helix-300">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-semibold text-white">
          Got it. We&apos;ll be in touch.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
          A founder reads every demo request. Expect a reply within one business day with
          times that work for a 30-minute call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 sm:p-8">
      <ol className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                i <= stepIdx
                  ? "border-helix-400/40 bg-helix-500/15 text-helix-200"
                  : "border-white/10 bg-white/5 text-zinc-500"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-xs",
                i <= stepIdx ? "text-zinc-200" : "text-zinc-500"
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1",
                  i < stepIdx ? "bg-helix-400/40" : "bg-white/10"
                )}
              />
            )}
          </li>
        ))}
      </ol>

      {step === "you" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.message}>
            <input
              {...register("fullName")}
              className="input"
              placeholder="Dr. R. Iyer"
              autoComplete="name"
            />
          </Field>
          <Field label="Work email" error={errors.workEmail?.message}>
            <input
              {...register("workEmail")}
              type="email"
              className="input"
              placeholder="r.iyer@northwindpharma.com"
              autoComplete="email"
            />
          </Field>
        </div>
      )}

      {step === "company" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" error={errors.company?.message}>
            <input
              {...register("company")}
              className="input"
              placeholder="Acme Pharma"
              autoComplete="organization"
            />
          </Field>
          <Field label="Your function" error={errors.role?.message}>
            <select {...register("role")} className="input">
              {leadSchema.shape.role.options.map((r) => (
                <option key={r} value={r} className="bg-ink-900">
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team size" error={errors.teamSize?.message}>
            <select {...register("teamSize")} className="input">
              {leadSchema.shape.teamSize.options.map((r) => (
                <option key={r} value={r} className="bg-ink-900">
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {step === "scope" && (
        <div className="grid gap-4">
          <Field label="Which engine are you interested in?" error={errors.interest?.message}>
            <select {...register("interest")} className="input">
              {leadSchema.shape.interest.options.map((r) => (
                <option key={r} value={r} className="bg-ink-900">
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tell us about the workflow" error={errors.useCase?.message}>
            <textarea
              {...register("useCase")}
              rows={4}
              className="input"
              placeholder="e.g., Triage 200 ICSRs / week, propose MedDRA codes, route severe cases."
            />
          </Field>
          <label className="flex items-start gap-3 text-xs text-zinc-400">
            <input
              {...register("consent")}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-ink-900 text-helix-500"
            />
            <span>
              I agree to be contacted by Evarx about my request. Evarx does not sell or share
              this information.
              {errors.consent?.message ? (
                <span className="mt-1 block text-rose-400">{errors.consent.message}</span>
              ) : null}
            </span>
          </label>
        </div>
      )}

      {serverError ? (
        <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {serverError}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStepIdx((i) => Math.max(i - 1, 0))}
          disabled={stepIdx === 0}
          className={cn(
            "btn-ghost text-sm",
            stepIdx === 0 && "pointer-events-none opacity-40"
          )}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {stepIdx < steps.length - 1 ? (
          <button type="button" onClick={onNext} className="btn-primary text-sm">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="submit" disabled={isSubmitting} className="btn-primary text-sm">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSubmitting ? "Sending…" : "Submit request"}
          </button>
        )}
      </div>

      <p className="mt-6 inline-flex items-center gap-2 text-[11px] text-zinc-500">
        <ShieldCheck className="h-3.5 w-3.5 text-helix-400" />
        Your information is stored in AWS Mumbai and never used for advertising.
      </p>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(10, 12, 26, 0.7);
          padding: 0.7rem 0.85rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: border-color 150ms;
        }
        .input::placeholder { color: rgb(113, 113, 122); }
        .input:focus { border-color: rgba(34, 196, 138, 0.45); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      {children}
      {error ? <span className="text-xs text-rose-400">{error}</span> : null}
    </label>
  );
}
