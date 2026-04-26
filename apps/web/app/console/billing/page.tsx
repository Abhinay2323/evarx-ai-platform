"use client";

import Link from "next/link";
import { useConsole } from "@/lib/console-store";

export default function BillingPage() {
  const {
    state: { tenant, kpis },
  } = useConsole();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-white">
          Billing
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Plan, usage, and invoices for {tenant.name}.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Current plan
          </p>
          <p className="mt-3 font-display text-2xl font-semibold text-white">
            {tenant.plan}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            On-prem CPU deployment · 80M token monthly cap · annual contract
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {kpis.slice(2, 3).map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-white/10 bg-ink-900/40 p-4"
              >
                <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                  {k.label}
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-white">
                  {k.value}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">{k.delta}</p>
              </div>
            ))}
            <div className="rounded-xl border border-white/10 bg-ink-900/40 p-4">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                Next invoice
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-white">
                ₹2,49,000
              </p>
              <p className="mt-1 text-[11px] text-zinc-400">due 1 May</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-ink-900/40 p-4">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                Status
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 font-display text-xl font-semibold text-helix-300">
                <span className="h-2 w-2 rounded-full bg-helix-400" />
                Active
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-sm font-semibold text-white">Need to upgrade?</p>
          <p className="mt-2 text-sm text-zinc-400">
            Contact your account team to expand cap, add seats, or scope
            another fine-tune.
          </p>
          <Link
            href="/demo"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-helix-500 px-3 py-1.5 text-xs font-medium text-ink-950 hover:bg-helix-400"
          >
            Talk to your CSM
          </Link>
        </div>
      </div>
    </div>
  );
}
