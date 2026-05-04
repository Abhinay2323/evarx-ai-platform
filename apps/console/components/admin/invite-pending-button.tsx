"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { PlatformOrg } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export function InvitePendingButton({
  userId,
  email,
  orgs
}: {
  userId: string;
  email: string;
  orgs: PlatformOrg[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [orgId, setOrgId] = useState(orgs[0]?.id ?? "");
  const [role, setRole] = useState<"member" | "admin" | "owner">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Session expired.");
        return;
      }
      const res = await fetch(`${BASE}/v1/platform/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: userId,
          org_id: orgId,
          role,
          send_email: true
        })
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setError(detail || `Failed (${res.status})`);
        return;
      }
      setDone(true);
      window.setTimeout(() => {
        setOpen(false);
        setDone(false);
        router.refresh();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (orgs.length === 0) {
    return (
      <span className="text-[11px] text-zinc-600">
        No orgs to invite to — create one first.
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-zinc-300 transition hover:border-helix-400/40 hover:text-helix-200"
      >
        <Send className="h-3 w-3" />
        Invite to org
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={orgId}
        onChange={(e) => setOrgId(e.target.value)}
        className="rounded-md border border-white/10 bg-ink-800/60 px-2 py-1 text-[11px] text-zinc-200 outline-none focus:border-helix-400/40"
      >
        {orgs.map((o) => (
          <option key={o.id} value={o.id} className="bg-ink-900">
            {o.name}
          </option>
        ))}
      </select>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as typeof role)}
        className="rounded-md border border-white/10 bg-ink-800/60 px-2 py-1 text-[11px] text-zinc-200 outline-none focus:border-helix-400/40"
      >
        <option value="member" className="bg-ink-900">
          Member
        </option>
        <option value="admin" className="bg-ink-900">
          Admin
        </option>
        <option value="owner" className="bg-ink-900">
          Owner
        </option>
      </select>
      <button
        type="button"
        onClick={() => void send()}
        disabled={busy || !orgId}
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-helix-400 to-plasma-500 px-2.5 py-1 text-[11px] font-semibold text-ink-950 transition hover:brightness-110",
          (busy || !orgId) && "pointer-events-none opacity-60"
        )}
        title={`Send invite to ${email}`}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        {done ? "Sent" : "Send"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-300"
      >
        Cancel
      </button>
      {error ? (
        <span className="text-[11px] text-red-300">{error}</span>
      ) : null}
    </div>
  );
}
