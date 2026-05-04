export type DocumentStatus = "queued" | "processing" | "ready" | "failed";

export interface DocumentRow {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  status: DocumentStatus;
  chunk_count: number;
  error: string | null;
  created_at: string;
}

export interface Citation {
  n: number;
  document_id: string;
  document_filename: string;
  chunk_index: number;
  snippet: string;
}

export interface Identity {
  user_id: string;
  supabase_id: string;
  email: string;
  org: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    region: string;
  };
  role: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  resource: string | null;
  status_code: number | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogPage {
  items: AuditLogEntry[];
  next_cursor: string | null;
}
