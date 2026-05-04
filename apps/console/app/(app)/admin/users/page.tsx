import { UserCheck } from "lucide-react";

import { InvitePendingButton } from "@/components/admin/invite-pending-button";
import { PageHeader } from "@/components/layout/page-header";
import { serverFetch } from "@/lib/server-fetch";
import type { PlatformOrg, PlatformPendingUser } from "@/lib/types";

export const metadata = { title: "Pending signups · Evarx Admin" };
export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default async function AdminPendingUsersPage() {
  let pending: PlatformPendingUser[] = [];
  let orgs: PlatformOrg[] = [];
  let error: string | null = null;

  try {
    [pending, orgs] = await Promise.all([
      serverFetch<PlatformPendingUser[]>("/v1/platform/users/pending"),
      serverFetch<PlatformOrg[]>("/v1/platform/orgs")
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Evarx admin"
        title="Pending signups"
        icon={<UserCheck className="h-5 w-5" />}
        description="Anyone who signed up at app.evarx.in without a matching invite. They're sitting on the awaiting-access screen until you invite them to an org or ignore them."
      />

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/40 px-6 py-10 text-center text-sm text-zinc-500">
          No pending signups. When someone signs up without an invite, they'll appear here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Signed up</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pending.map((u) => (
                <tr key={u.id} className="text-zinc-200">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {fmtDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <InvitePendingButton
                      userId={u.id}
                      email={u.email}
                      orgs={orgs}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
