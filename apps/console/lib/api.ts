// Client for talking to the FastAPI backend at api.evarx.in. Caller must
// pass the Supabase access token explicitly — we never read it from a
// global so this stays SSR-safe.

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: { token?: string; method?: string; body?: unknown; signal?: AbortSignal } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ApiError(res.status, detail || `API ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
