"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

interface Preview {
  org_name: string;
  org_slug: string;
  role: string;
  email: string;
  expires_at: string;
}

type State =
  | { kind: "loading" }
  | { kind: "preview"; preview: Preview }
  | { kind: "wrong_email"; preview: Preview; userEmail: string }
  | { kind: "accepting"; preview: Preview }
  | { kind: "accepted"; preview: Preview }
  | { kind: "error"; message: string };

export function AcceptInvite({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function load() {
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        // Middleware should have redirected to /login already, but as a safety net:
        router.replace(`/login?redirect=/invites/${token}`);
        return;
      }
      const res = await fetch(`${BASE}/v1/invites/${token}/preview`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store"
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setState({
          kind: "error",
          message: detail || `Could not load invite (${res.status})`
        });
        return;
      }
      const preview = (await res.json()) as Preview;
      const userEmail = (session.user.email ?? "").toLowerCase();
      if (userEmail !== preview.email.toLowerCase()) {
        setState({ kind: "wrong_email", preview, userEmail });
      } else {
        setState({ kind: "preview", preview });
      }
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not load invite"
      });
    }
  }

  async function accept() {
    if (state.kind !== "preview") return;
    setState({ kind: "accepting", preview: state.preview });
    try {
      const supabase = createClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=/invites/${token}`);
        return;
      }
      const res = await fetch(`${BASE}/v1/invites/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ token })
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        setState({
          kind: "error",
          message: detail || `Could not accept (${res.status})`
        });
        return;
      }
      setState({ kind: "accepted", preview: state.preview });
      window.setTimeout(() => router.replace("/dashboard"), 1200);
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : "Could not accept"
      });
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6 shadow-glow">
      {state.kind === "loading" ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading invite…
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div>
          <h2 className="text-base font-semibold text-white">Invite unavailable</h2>
          <p className="mt-2 text-sm text-red-300">{state.message}</p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
          >
            Back to dashboard
          </button>
        </div>
      ) : null}

      {state.kind === "wrong_email" ? (
        <div>
          <h2 className="text-base font-semibold text-white">
            Sign in with the invited email
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            This invite was sent to{" "}
            <strong className="text-zinc-200">{state.preview.email}</strong>, but
            you're signed in as {state.userEmail}. Sign out and back in with the
            invited address to accept.
          </p>
        </div>
      ) : null}

      {state.kind === "preview" || state.kind === "accepting" || state.kind === "accepted" ? (
        <div>
          <h2 className="text-base font-semibold text-white">
            Join <span className="text-helix-300">{state.preview.org_name}</span>
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            You'll join as a <strong className="capitalize text-zinc-200">{state.preview.role}</strong>.
          </p>

          <button
            type="button"
            onClick={() => void accept()}
            disabled={state.kind !== "preview"}
            className={cn(
              "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-helix-400 to-plasma-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110",
              state.kind !== "preview" && "pointer-events-none opacity-70"
            )}
          >
            {state.kind === "accepting" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {state.kind === "accepted" ? <CheckCircle2 className="h-4 w-4" /> : null}
            {state.kind === "accepted" ? "Joined — redirecting…" : "Accept invite"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
