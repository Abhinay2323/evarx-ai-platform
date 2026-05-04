import { ShieldCheck } from "lucide-react";

import { AuditTable } from "@/components/audit/audit-table";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Audit log · Evarx Console" };
export const dynamic = "force-dynamic";

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Compliance"
        title="Audit log"
        icon={<ShieldCheck className="h-5 w-5" />}
        description="Append-only record of every action your org performs. Bodies are hashed, never stored. Use this for DPDP compliance and incident review."
      />
      <AuditTable />
    </div>
  );
}
