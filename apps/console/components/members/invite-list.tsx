"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { InviteRow } from "@/lib/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function InviteList({ initial }: { initial: InviteRow[] }) {
  const router = useRouter();
  const [invites, setInvites] = useState<InviteRow[]>(initial);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  if (invites.length === 0) {
    return (
      <p className="text-xs text-zinc-500">No pending invites.</p>
    );
  }

  async function revoke(id: string, email: string) {
    if (!window.confirm(`Revoke pending invite for ${email}?`)) return;
    setRevoking(id);
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${BASE}/v1/orgs/me/invites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      }
    } finally {
      setRevoking(null);
    }
  }

  async function copyLink(token: string) {
    const link = `${window.location.origin}/invites/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(token);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="px-4 py-3 text-left font-medium">Invited by</th>
            <th className="px-4 py-3 text-left font-medium">Expires</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {invites.map((inv) => (
            <tr key={inv.id} className="text-zinc-200">
              <td className="px-4 py-3">{inv.email}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs capitalize text-zinc-300">
                  {inv.role}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-400">
                {inv.invited_by_email ?? "—"}
              </td>
              <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(inv.expires_at)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => void copyLink(inv.token)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-[11px] text-zinc-300 transition hover:bg-white/10"
                    title="Copy invite link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === inv.token ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void revoke(inv.id, inv.email)}
                    disabled={revoking === inv.id}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    aria-label="Revoke invite"
                  >
                    {revoking === inv.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
