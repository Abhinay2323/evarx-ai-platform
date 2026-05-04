import type { ReactNode } from "react";

import { ConsoleShell } from "@/components/layout/console-shell";
import { PendingScreen } from "@/components/layout/pending-screen";
import { serverFetch } from "@/lib/server-fetch";
import { createClient } from "@/lib/supabase/server";
import type { Identity } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const email = user?.email ?? null;

  let identity: Identity | null = null;
  try {
    identity = await serverFetch<Identity>("/v1/me");
  } catch {
    // API unavailable — treat as pending so we don't show a broken shell.
    return <PendingScreen email={email} />;
  }

  if (identity.status !== "active" || identity.org === null) {
    return <PendingScreen email={email} />;
  }

  return (
    <ConsoleShell email={email} orgName={identity.org.name}>
      {children}
    </ConsoleShell>
  );
}
