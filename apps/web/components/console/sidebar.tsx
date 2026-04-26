"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  Bot,
  Cpu,
  Database,
  ScrollText,
  CreditCard,
  Settings,
  ArrowLeft
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

const items = [
  { label: "Dashboard", href: "/console", icon: LayoutDashboard, exact: true },
  { label: "Workflows", href: "/console/workflows", icon: Workflow },
  { label: "Agents", href: "/console/agents", icon: Bot },
  { label: "Models", href: "/console/models", icon: Cpu },
  { label: "Data sources", href: "/console/data", icon: Database },
  { label: "Logs", href: "/console/logs", icon: ScrollText },
  { label: "Billing", href: "/console/billing", icon: CreditCard },
  { label: "Settings", href: "/console/settings", icon: Settings }
];

export function ConsoleSidebar() {
  const path = usePathname() ?? "";
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-ink-950 lg:sticky lg:top-0 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <Logo />
        <span className="rounded-full border border-helix-400/30 bg-helix-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-helix-200">
          Console
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = it.exact ? path === it.href : path.startsWith(it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-helix-500/10 text-helix-200"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <it.icon
                    className={cn("h-4 w-4", active ? "text-helix-300" : "text-zinc-500 group-hover:text-zinc-300")}
                  />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to marketing site
        </Link>
      </div>
    </aside>
  );
}
