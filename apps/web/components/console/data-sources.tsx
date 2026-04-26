"use client";

import { Database } from "lucide-react";
import Link from "next/link";
import { useConsole } from "@/lib/console-store";

export function DataSources() {
  const {
    state: { dataSources },
  } = useConsole();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <header className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Data sources</p>
        <Link
          href="/console/data"
          className="text-xs text-helix-300 hover:underline"
        >
          Manage
        </Link>
      </header>
      <ul className="mt-5 divide-y divide-white/5">
        {dataSources.map((d) => (
          <li
            key={d.name}
            className="flex items-center justify-between py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-helix-300">
                <Database className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-white">{d.name}</p>
                <p className="text-[11px] text-zinc-500">
                  {d.docs.toLocaleString("en-IN")} docs
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">
              {d.lastSync}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
