"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { PlatformOrgCreated } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const schema = z.object({
  name: z.string().min(2, "Required").max(120),
  slug: z
    .string()
    .max(60)
    .regex(/^[a-z0-9-]*$/, "Lowercase letters / digits / hyphens only")
    .optional()
    .or(z.literal("")),
  plan: z.enum(["standard", "growth", "enterprise"]),
  owner_email: z.string().email("Enter a valid email")
});

type FormValues = z.infer<typeof schema>;

export function CreateOrgForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<PlatformOrgCreated | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { plan: "standard" }
  });

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
      const res = await fetch(`${BASE}/v1/platform/orgs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: values.name,
          slug: values.slug || undefined,
          plan: values.plan,
          owner_email: values.owner_email,
          send_email: true
        })
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setServerError(detail || `Create failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as PlatformOrgCreated;
      setCreated(data);
      reset({ name: "", slug: "", plan: "standard", owner_email: "" });
      router.refresh();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Create failed");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 px-3 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-110"
      >
        <Plus className="h-4 w-4" />
        New customer org
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <h2 className="text-sm font-semibold text-white">New customer org</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Create a workspace for a new customer. We send an invite to the owner email
        — they sign up and become owner of the new org.
      </p>

      <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Organization name" error={errors.name?.message}>
            <input
              type="text"
              placeholder="Cipla Limited"
              {...register("name")}
              className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-helix-400/40"
            />
          </Field>
          <Field
            label="Slug (optional)"
            error={errors.slug?.message}
            hint="URL-safe id. Auto-derived from name if blank."
          >
            <input
              type="text"
              placeholder="cipla"
              {...register("slug")}
              className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-helix-400/40"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Plan">
            <select
              {...register("plan")}
              className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-helix-400/40"
            >
              <option value="standard" className="bg-ink-900">
                Standard
              </option>
              <option value="growth" className="bg-ink-900">
                Growth
              </option>
              <option value="enterprise" className="bg-ink-900">
                Enterprise
              </option>
            </select>
          </Field>
          <Field label="Owner email" error={errors.owner_email?.message}>
            <input
              type="email"
              placeholder="cmo@cipla.com"
              {...register("owner_email")}
              className="w-full rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-helix-400/40"
            />
          </Field>
        </div>

        {serverError ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {serverError}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCreated(null);
              setServerError(null);
            }}
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
            Create org
          </button>
        </div>
      </form>

      {created ? <CreatedBanner created={created} /> : null}
    </div>
  );
}

function CreatedBanner({ created }: { created: PlatformOrgCreated }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(created.invite.accept_url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const subtitle =
    created.invite.email_sent === true
      ? "Owner invite email sent."
      : created.invite.email_sent === false
        ? "Email failed — share the link manually."
        : "Email delivery isn't configured — share the link manually.";

  return (
    <div className="mt-4 rounded-xl border border-helix-400/30 bg-helix-400/5 p-3 text-xs text-helix-100">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-helix-300" />
        <div className="flex-1">
          <p className="font-medium">
            Created{" "}
            <span className="text-white">{created.org.name}</span>
            {" · "}
            <span className="font-mono text-[11px] text-helix-200">
              {created.org.slug}
            </span>
          </p>
          <p className="mt-1 text-helix-200/80">{subtitle}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-white/10 bg-ink-950/50 px-2 py-1.5 font-mono text-[11px] text-zinc-300">
              {created.invite.accept_url}
            </code>
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-200 transition hover:bg-white/10"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
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
