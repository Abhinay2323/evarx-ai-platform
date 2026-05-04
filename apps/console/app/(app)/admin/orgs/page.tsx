import { Building2, FileText, Users } from "lucide-react";

import { CreateOrgForm } from "@/components/admin/create-org-form";
import { PageHeader } from "@/components/layout/page-header";
import { serverFetch } from "@/lib/server-fetch";
import type { PlatformOrg } from "@/lib/types";

export const metadata = { title: "Customer orgs · Evarx Admin" };
export const dynamic = "force-dynamic";

const PLAN_TONE: Record<string, string> = {
  standard: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  growth: "border-plasma-400/40 bg-plasma-400/10 text-plasma-200",
  enterprise: "border-helix-400/40 bg-helix-400/10 text-helix-200"
};

function fmt(n: number): string {
  return n.toLocaleString();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default async function AdminOrgsPage() {
  let orgs: PlatformOrg[] = [];
  let error: string | null = null;
  try {
    orgs = await serverFetch<PlatformOrg[]>("/v1/platform/orgs");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Evarx admin"
        title="Customer orgs"
        icon={<Building2 className="h-5 w-5" />}
        description="Provision a new workspace for a customer. We create the org, generate an owner invite, and (if SMTP is configured) email it."
      />

      <div className="mb-6">
        <CreateOrgForm />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : orgs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-ink-900/40 px-6 py-10 text-center text-sm text-zinc-500">
          No customer orgs yet. Create the first one above.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Plan</th>
                <th className="px-4 py-3 text-left font-medium">Members</th>
                <th className="px-4 py-3 text-left font-medium">Documents</th>
                <th className="px-4 py-3 text-left font-medium">Region</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orgs.map((o) => (
                <tr key={o.id} className="text-zinc-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{o.name}</div>
                    <div className="font-mono text-[11px] text-zinc-500">{o.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize ${
                        PLAN_TONE[o.plan] ?? "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      {o.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-zinc-500" />
                      {fmt(o.member_count)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-300">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-zinc-500" />
                      {fmt(o.document_count)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">{o.region}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {fmtDate(o.created_at)}
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
