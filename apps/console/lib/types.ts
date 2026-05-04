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
  email_sent?: boolean | null;
}

export type ModelId = "evarx-standard" | "evarx-medical";

export interface AgentRow {
  id: string;
  name: string;
  description: string | null;
  system_prompt_addendum: string | null;
  preferred_model: ModelId;
  document_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface AgentTemplate {
  slug: string;
  name: string;
  function: string;
  specialty: string;
  audience: string;
  short: string;
  inputs: string[];
  outputs: string[];
  preferred_model: ModelId;
  system_prompt_addendum: string;
}

export interface ModelInfo {
  id: ModelId;
  label: string;
  kind: "cloud" | "edge";
  description: string;
  status_label: "Live" | "Stand-in" | "Coming soon";
  available: boolean;
  recommended_for: string[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[];
}
