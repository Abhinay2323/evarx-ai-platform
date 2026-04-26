"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  LogOut,
  RotateCcw,
  Settings,
  UserRound,
} from "lucide-react";
import { resetConsoleState, useConsole } from "@/lib/console-store";

export function UserMenu({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const {
    state: { tenant },
  } = useConsole();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] py-1 pl-1 pr-2 transition hover:bg-white/[0.04]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-plasma-500 to-helix-500 text-xs font-semibold text-ink-950">
          {tenant.user.initials}
        </span>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-medium text-white">{tenant.user.name}</p>
          <p className="text-[10px] text-zinc-500">{tenant.user.role}</p>
        </div>
        <ChevronDown className="h-3 w-3 text-zinc-400" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-ink-900/95 shadow-cell backdrop-blur"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">
              {tenant.user.name}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-500">
              {tenant.name} · {tenant.user.role}
            </p>
          </div>
          <div className="p-1.5">
            <MenuItem
              href="/console/settings"
              icon={<UserRound className="h-3.5 w-3.5" />}
              onSelect={onClose}
            >
              Profile
            </MenuItem>
            <MenuItem
              href="/console/settings"
              icon={<Settings className="h-3.5 w-3.5" />}
              onSelect={onClose}
            >
              Settings
            </MenuItem>
            <hr className="my-1 border-white/10" />
            <MenuItem
              href="/"
              icon={<ArrowLeft className="h-3.5 w-3.5" />}
              onSelect={onClose}
            >
              Back to home
            </MenuItem>
            <button
              type="button"
              onClick={() => {
                onClose();
                resetConsoleState();
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-zinc-300 hover:bg-white/5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo state
            </button>
            <hr className="my-1 border-white/10" />
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  onSelect,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-200 hover:bg-white/5"
    >
      {icon}
      {children}
    </Link>
  );
}
