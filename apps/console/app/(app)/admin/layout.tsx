import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { serverFetch } from "@/lib/server-fetch";
import type { Identity } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let identity: Identity | null = null;
  try {
    identity = await serverFetch<Identity>("/v1/me");
  } catch {
    redirect("/dashboard");
  }
  if (!identity?.is_platform_admin) {
    redirect("/dashboard");
  }
  return <>{children}</>;
}
