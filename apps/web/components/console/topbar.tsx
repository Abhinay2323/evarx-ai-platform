"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useConsole } from "@/lib/console-store";
import { NotificationsPanel } from "@/components/console/notifications-panel";
import { SearchPopover } from "@/components/console/search-popover";
import { UserMenu } from "@/components/console/user-menu";

export function ConsoleTopbar() {
  const { state, dispatch } = useConsole();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const searchWrapRef = useRef<HTMLDivElement>(null);
  const notifWrapRef = useRef<HTMLDivElement>(null);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  // Close popovers on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchWrapRef.current && !searchWrapRef.current.contains(t)) {
        setSearchFocused(false);
      }
      if (notifWrapRef.current && !notifWrapRef.current.contains(t)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close user menu on outside click — handled here so all three are
  // consistent. Separate ref because UserMenu owns its own button DOM.
  useEffect(() => {
    if (!userOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest("[data-user-menu-root]")) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/10 bg-ink-950/85 px-6 backdrop-blur">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-helix-400" />
        <span className="text-zinc-200">{state.tenant.name}</span>
        <span className="text-zinc-500">· {state.tenant.region}</span>
        <ChevronDown className="h-3 w-3 text-zinc-500" />
      </div>

      <div
        ref={searchWrapRef}
        className="relative hidden flex-1 max-w-md md:block"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          placeholder="Search workflows, agents, fine-tune jobs…"
          value={state.search}
          onChange={(e) => dispatch({ type: "SET_SEARCH", q: e.target.value })}
          onFocus={() => setSearchFocused(true)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.02] py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:border-helix-400/40 focus:outline-none"
        />
        <SearchPopover
          open={searchFocused}
          query={state.search}
          onSelect={() => {
            setSearchFocused(false);
            dispatch({ type: "SET_SEARCH", q: "" });
          }}
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div ref={notifWrapRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-lg border border-white/10 bg-white/[0.02] p-2 text-zinc-400 transition hover:text-white"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-helix-500 px-1 text-[9px] font-semibold text-ink-950">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
          {notifOpen ? (
            <NotificationsPanel onClose={() => setNotifOpen(false)} />
          ) : null}
        </div>

        <div data-user-menu-root>
          <UserMenu
            open={userOpen}
            onToggle={() => setUserOpen((v) => !v)}
            onClose={() => setUserOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
