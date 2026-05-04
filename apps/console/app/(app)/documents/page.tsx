import { FileText } from "lucide-react";

import { DocumentList } from "@/components/documents/document-list";
import { UploadZone } from "@/components/documents/upload-zone";
import { PageHeader } from "@/components/layout/page-header";
import { serverFetch } from "@/lib/server-fetch";
import type { DocumentRow } from "@/lib/types";

export const metadata = { title: "Documents · Evarx Console" };
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  let docs: DocumentRow[] = [];
  let loadError: string | null = null;
  try {
    docs = await serverFetch<DocumentRow[]>("/v1/documents");
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load documents";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Workspace"
        title="Documents"
        icon={<FileText className="h-5 w-5" />}
        description="Upload protocols, SOPs, regulatory docs. Each upload is text-extracted, chunked, and embedded automatically — ready for retrieval in chat."
      />

      <div className="space-y-6">
        <UploadZone />
        {loadError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {loadError}
          </div>
        ) : (
          <DocumentList initial={docs} />
        )}
      </div>
    </div>
  );
}
