import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { DocumentList } from "@/components/documents/document-list";
import { UploadZone } from "@/components/documents/upload-zone";
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

        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-white">Documents</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Upload protocols, SOPs, regulatory docs. Everything you upload becomes
            retrievable in chat.
          </p>
        </div>

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
      </main>
    </div>
  );
}
