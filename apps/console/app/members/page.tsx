import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { InviteForm } from "@/components/members/invite-form";
import { InviteList } from "@/components/members/invite-list";
import { serverFetch } from "@/lib/server-fetch";
import type { Identity, InviteRow, MemberRow } from "@/lib/types";

export const metadata = { title: "Members · Evarx Console" };
export const dynamic = "force-dynamic";

const ADMIN_ROLES = new Set(["owner", "admin"]);

const ROLE_TONE: Record<string, string> = {
  owner: "border-helix-400/40 bg-helix-400/10 text-helix-200",
  admin: "border-plasma-400/40 bg-plasma-400/10 text-plasma-200",
  member: "border-white/10 bg-white/5 text-zinc-300",
  viewer: "border-white/10 bg-white/5 text-zinc-400"
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default async function MembersPage() {
  let identity: Identity | null = null;
  let members: MemberRow[] = [];
  let invites: InviteRow[] = [];
  let error: string | null = null;

  try {
    identity = await serverFetch<Identity>("/v1/me");
    members = await serverFetch<MemberRow[]>("/v1/orgs/me/members");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load members";
  }

  const isAdmin = identity ? ADMIN_ROLES.has(identity.role) : false;
  const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://evarx.in";

  if (isAdmin) {
    try {
      invites = await serverFetch<InviteRow[]>("/v1/orgs/me/invites");
    } catch {
      // non-fatal
    }
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-white/10 bg-ink-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-display font-bold text-white">
            Evarx Console
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-300">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-xl border border-white/10 bg-helix-500/10 p-2 text-helix-300">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Members</h1>
            {identity ? (
              <p className="mt-1 text-sm text-zinc-400">
                {identity.org.name} · {identity.org.plan} plan · region {identity.org.region}
              </p>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {isAdmin ? <InviteForm marketingUrl={marketingUrl} /> : null}

            <section>
              <h2 className="mb-3 text-sm font-semibold text-zinc-300">
                Active members ({members.length})
              </h2>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Role</th>
                      <th className="px-4 py-3 text-left font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((m) => (
                      <tr key={m.user_id} className="text-zinc-200">
                        <td className="px-4 py-3">
                          <span>{m.email}</span>
                          {m.is_self ? (
                            <span className="ml-2 text-[10px] uppercase tracking-wide text-zinc-500">
                              you
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize ${
                              ROLE_TONE[m.role] ?? "border-white/10 bg-white/5 text-zinc-300"
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">
                          {fmtDate(m.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {isAdmin ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-zinc-300">
                  Pending invites ({invites.length})
                </h2>
                <InviteList initial={invites} />
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
