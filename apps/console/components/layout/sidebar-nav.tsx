"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Building2,
  Cpu,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  type LucideIcon
} from "lucide-react";

import { cn } from "@/lib/cn";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "WIP";
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const BASE_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/chat", label: "Chat", icon: MessageSquareText },
      { href: "/agents", label: "Agents", icon: Bot },
      { href: "/documents", label: "Documents", icon: FileText }
    ]
  },
  {
    label: "Platform",
    items: [
      { href: "/models", label: "Models", icon: Sparkles },
      { href: "/finetuning", label: "Fine-tuning", icon: Cpu, badge: "WIP" },
      { href: "/audit", label: "Audit log", icon: ShieldCheck },
      { href: "/usage", label: "Usage", icon: LayoutDashboard }
    ]
  },
  {
    label: "Org",
    items: [{ href: "/members", label: "Members", icon: Users }]
  }
];

const ADMIN_SECTION: NavSection = {
  label: "Evarx Admin",
  items: [
    { href: "/admin/orgs", label: "Customer orgs", icon: Building2 },
    { href: "/admin/users", label: "Pending signups", icon: UserCheck }
  ]
};

export function SidebarNav({
  orgName,
  isPlatformAdmin = false
}: {
  orgName: string | null;
  isPlatformAdmin?: boolean;
}) {
  const sections = isPlatformAdmin
    ? [...BASE_SECTIONS, ADMIN_SECTION]
    : BASE_SECTIONS;
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-6 px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-helix-400 to-plasma-500 text-ink-950">
          <span className="font-display text-base font-bold">E</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-display font-semibold text-white">Evarx</p>
          {orgName ? (
            <p className="text-[10px] uppercase tracking-wide text-zinc-500">
              {orgName}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition",
                        active
                          ? "bg-helix-400/10 text-white"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      )}
                    >
                      {active ? (
                        <span className="absolute -left-4 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-helix-400 to-plasma-500" />
                      ) : null}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition",
                          active ? "text-helix-300" : "text-zinc-500 group-hover:text-zinc-300"
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge === "WIP" ? (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-200">
                          WIP
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-ink-900/60 p-3 text-xs text-zinc-400">
        <p className="font-medium text-zinc-300">Mumbai · ap-south-1</p>
        <p className="mt-1 leading-relaxed">
          Hosted in-region for DPDP. Edge SLM deploys land soon —{" "}
          <Link href="/finetuning" className="text-helix-300 hover:underline">
            track progress
          </Link>
          .
        </p>
      </div>
    </nav>
  );
}
