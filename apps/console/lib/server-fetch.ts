// Server-side fetch to the Evarx API. Pulls the Supabase session out of the
// httpOnly cookie via the SSR client and forwards the access token.

import { createClient } from "@/lib/supabase/server";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export async function serverFetch<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; cache?: RequestCache } = {}
): Promise<T> {
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache ?? "no-store"
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
