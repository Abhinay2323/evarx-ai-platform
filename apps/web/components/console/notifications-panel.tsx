"use client";

import {
  Bot,
  Cpu,
  Database,
  Rocket,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import { useConsole, type Notification } from "@/lib/console-store";

const KIND_META: Record<
  Notification["kind"],
  { icon: React.ReactNode; tone: string }
> = {
  agent: { icon: <Bot className="h-3.5 w-3.5" />, tone: "text-helix-300" },
  train: { icon: <Cpu className="h-3.5 w-3.5" />, tone: "text-plasma-300" },
  deploy: { icon: <Rocket className="h-3.5 w-3.5" />, tone: "text-amber-300" },
  data: { icon: <Database className="h-3.5 w-3.5" />, tone: "text-cyan-300" },
  system: { icon: <Sparkles className="h-3.5 w-3.5" />, tone: "text-zinc-300" },
};

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useConsole();
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full z-30 mt-2 w-[22rem] overflow-hidden rounded-xl border border-white/10 bg-ink-900/95 shadow-cell backdrop-blur"
    >
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Notifications</p>
          <p className="text-[11px] text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-300 hover:bg-white/5"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
        ) : null}
      </header>

      <ul className="max-h-96 overflow-y-auto divide-y divide-white/5">
        {state.notifications.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-zinc-500">
            No activity yet.
          </li>
        ) : (
          state.notifications.map((n) => {
            const meta = KIND_META[n.kind];
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!n.read)
                      dispatch({ type: "MARK_NOTIFICATION_READ", id: n.id });
                  }}
                  className={
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03] " +
                    (!n.read ? "bg-helix-500/[0.04]" : "")
                  }
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] ${meta.tone}`}
                  >
                    {meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm text-white">{n.actor}</span>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-helix-400" />
                      )}
                    </span>
                    <span className="block text-xs text-zinc-400">{n.text}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-zinc-600">
                      {n.when}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      <footer className="border-t border-white/10 px-4 py-2.5 text-center">
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-zinc-500 hover:text-zinc-300"
        >
          Close
        </button>
      </footer>
    </div>
  );
}
