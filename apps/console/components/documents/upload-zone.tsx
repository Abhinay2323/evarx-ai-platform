"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const ACCEPT = ".pdf,.docx,.txt,.md";

export function UploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const supabase = createClient();
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (!session) {
          setError("Session expired. Refresh and try again.");
          return;
        }

        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(`${BASE}/v1/documents`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: fd
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          setError(detail || `Upload failed (${res.status})`);
          return;
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [router]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void submit(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 bg-ink-900/40 px-6 py-10 text-center transition",
        dragOver && "border-helix-400/60 bg-helix-400/5",
        uploading && "pointer-events-none opacity-70"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void submit(file);
          e.target.value = "";
        }}
      />
      <div className="rounded-full border border-white/10 bg-white/5 p-3">
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-helix-300" />
        ) : (
          <CloudUpload className="h-6 w-6 text-helix-300" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-white">
          {uploading ? "Uploading…" : "Drop a document or click to upload"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          PDF, DOCX, TXT, MD. Max 25 MB. Indexed for retrieval automatically.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
