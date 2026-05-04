"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["member", "admin"])
});

type FormValues = z.infer<typeof schema>;

interface CreatedInvite {
  email: string;
  token: string;
  email_sent?: boolean | null;
}

export function InviteForm({ marketingUrl }: { marketingUrl: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInvite | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "member" }
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
      const res = await fetch(`${BASE}/v1/orgs/me/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(values)
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setServerError(detail || `Invite failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as {
        email: string;
        token: string;
        email_sent?: boolean | null;
      };
      setCreated({ email: data.email, token: data.token, email_sent: data.email_sent });
      reset({ email: "", role: "member" });
      router.refresh();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Invite failed");
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <div className="flex items-center gap-2 text-zinc-300">
        <UserPlus className="h-4 w-4 text-helix-300" />
        <h2 className="text-sm font-semibold text-white">Invite a teammate</h2>
      </div>

      <form className="flex flex-wrap items-start gap-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              autoComplete="email"
              placeholder="teammate@company.com"
              {...register("email")}
              className={cn(
                "w-full rounded-xl border border-white/10 bg-ink-800/60 pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-helix-400/40",
                errors.email && "border-red-500/40"
              )}
            />
          </div>
          {errors.email ? (
            <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>
          ) : null}
        </div>
        <select
          {...register("role")}
          className="rounded-xl border border-white/10 bg-ink-800/60 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-helix-400/40"
        >
          <option value="member" className="bg-ink-900">
            Member
          </option>
          <option value="admin" className="bg-ink-900">
            Admin
          </option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110",
            isSubmitting && "pointer-events-none opacity-70"
          )}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send invite
        </button>
      </form>

      {serverError ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {serverError}
        </p>
      ) : null}

      {created ? <CreatedInviteBanner created={created} marketingUrl={marketingUrl} /> : null}
    </div>
  );
}

function CreatedInviteBanner({
  created,
  marketingUrl
}: {
  created: CreatedInvite;
  marketingUrl: string;
}) {
  const consoleOrigin = marketingUrl.replace("https://evarx.in", "https://app.evarx.in");
  const link = `${consoleOrigin}/invites/${created.token}`;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const sub =
    created.email_sent === true
      ? `Email sent. They can also accept via the link below.`
      : created.email_sent === false
        ? `Email delivery failed — share the link manually.`
        : `Email delivery isn't configured — share this link manually.`;

  return (
    <div className="rounded-xl border border-helix-400/30 bg-helix-400/5 p-3 text-xs text-helix-100">
      <p className="font-medium">Invite created for {created.email}</p>
      <p className="mt-1 text-helix-200/80">{sub}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border border-white/10 bg-ink-950/50 px-2 py-1.5 font-mono text-[11px] text-zinc-300">
          {link}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-zinc-200 transition hover:bg-white/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
