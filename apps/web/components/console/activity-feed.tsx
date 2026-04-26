"use client";

import { Bot, FlaskConical, Server, Database, Sparkles } from "lucide-react";
import { useConsole, type Notification } from "@/lib/console-store";
import { cn } from "@/lib/cn";

const iconByKind: Record<Notification["kind"], typeof Bot> = {
  agent: Bot,
  train: FlaskConical,
  deploy: Server,
  data: Database,
  system: Sparkles,
};

const colorByKind: Record<Notification["kind"], string> = {
  agent: "text-helix-300",
  train: "text-plasma-300",
  deploy: "text-amber-300",
  data: "text-zinc-300",
  system: "text-zinc-300",
};

export function ActivityFeed() {
  const {
    state: { notifications },
  } = useConsole();
  const items = notifications.slice(0, 8);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <header className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Activity</p>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full bg-helix-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-helix-400" />
          </span>
          live
        </span>
      </header>

      {items.length === 0 ? (
        <p className="mt-6 text-center text-xs text-zinc-500">
          No activity yet. Create an agent or queue a fine-tune job to see events here.
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {items.map((a) => {
            const Icon = iconByKind[a.kind];
            return (
              <li key={a.id} className="flex gap-3 text-sm">
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02]",
                    colorByKind[a.kind],
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1">
                  <p className="text-zinc-200">
                    <span className="font-medium text-white">{a.actor}</span>{" "}
                    <span className="text-zinc-400">{a.text}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{a.when}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
