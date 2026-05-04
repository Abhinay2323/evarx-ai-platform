"use client";

import { type ReactNode, useState } from "react";
import { X } from "lucide-react";

import { BackgroundGlow } from "@/components/layout/background-glow";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

export function ConsoleShell({
  email,
  orgName,
  children
}: {
  email: string | null;
  orgName: string | null;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-ink-950 text-zinc-100">
      <BackgroundGlow />

      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-ink-950/80 backdrop-blur lg:block">
          <SidebarNav orgName={orgName} />
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div
              className="flex-1 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative w-72 border-l border-white/10 bg-ink-950">
              <button
                type="button"
                className="absolute right-3 top-4 rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarNav orgName={orgName} />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-col">
          <TopBar email={email} onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
