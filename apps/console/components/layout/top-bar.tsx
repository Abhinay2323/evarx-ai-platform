"use client";

import { useState } from "react";
import { LogOut, Menu, User as UserIcon } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/cn";

export function TopBar({
  email,
  onOpenMobileNav
}: {
  email: string | null;
  onOpenMobileNav: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (email ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-ink-950/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-1.5 py-1 pr-3 transition hover:border-helix-400/40 hover:bg-helix-400/5",
            menuOpen && "border-helix-400/40 bg-helix-400/5"
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-helix-400 to-plasma-500 text-[11px] font-semibold text-ink-950">
            {initials}
          </span>
          <span className="hidden text-xs text-zinc-300 sm:inline">{email ?? "Account"}</span>
        </button>

        {menuOpen ? (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-2xl">
              <div className="border-b border-white/10 px-3 py-3">
                <div className="flex items-center gap-2 text-zinc-300">
                  <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                  <p className="truncate text-xs">{email ?? "—"}</p>
                </div>
              </div>
              <div className="p-1">
                <div className="rounded-lg px-2 py-1.5 text-[11px] uppercase tracking-wide text-zinc-500">
                  Session
                </div>
                <div className="px-1 pb-1">
                  <LogoutButton
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-zinc-300 transition hover:bg-red-500/10 hover:text-red-200"
                    icon={<LogOut className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
