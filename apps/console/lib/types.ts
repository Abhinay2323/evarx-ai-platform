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

export interface UsageSummary {
  documents_total: number;
  documents_ready: number;
  chunks_total: number;
  storage_bytes: number;
  queries_total: number;
  queries_30d: number;
  queries_this_month: number;
  org_created_at: string;
}

export interface DailyPoint {
  date: string;
  count: number;
}

export interface DailySeries {
  points: DailyPoint[];
}

export interface MemberRow {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
  is_self: boolean;
}

export interface InviteRow {
  id: string;
  email: string;
  role: string;
  token: string;
  created_at: string;
  expires_at: string;
  invited_by_email: string | null;
}
