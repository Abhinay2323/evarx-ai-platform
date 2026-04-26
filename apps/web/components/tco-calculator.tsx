"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Cloud, IndianRupee, TrendingDown, Server, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const FRONTIER_PRICING_PER_MTOK = 1250;
const CUSTOM_SLM_PRICING_PER_MTOK = 35;
const CUSTOM_SLM_FIXED_INFRA_INR = 65000;
const PRIVATE_SLM_PRICING_PER_MTOK = 180;

interface CostRow {
  name: string;
  icon: typeof Cpu;
  perMillion: number;
  fixed: number;
  hint: string;
  highlight?: boolean;
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1
});

export function TCOCalculator() {
  const [monthlyTokens, setMonthlyTokens] = useState(50);
  const [users, setUsers] = useState(20);
  const [onPrem, setOnPrem] = useState(true);

  const rows: CostRow[] = useMemo(() => {
    const tokensM = monthlyTokens;
    const seatLoad = Math.max(0, users - 10) * 1500;
    return [
      {
        name: "Frontier hosted API",
        icon: Cloud,
        perMillion: FRONTIER_PRICING_PER_MTOK,
        fixed: seatLoad,
        hint: "Per-token pricing dominates at this volume.",
        highlight: false
      },
      {
        name: "Evarx Private (Medical SLM)",
        icon: Server,
        perMillion: PRIVATE_SLM_PRICING_PER_MTOK,
        fixed: 35000 + seatLoad / 2,
        hint: "GPU-backed inference in your VPC.",
        highlight: false
      },
      {
        name: "Evarx Custom (Fine-tuned · CPU)",
        icon: Cpu,
        perMillion: CUSTOM_SLM_PRICING_PER_MTOK,
        fixed: onPrem ? 0 : CUSTOM_SLM_FIXED_INFRA_INR,
        hint: onPrem
          ? "Runs on hardware you already own."
          : "Includes managed VPC inference cluster.",
        highlight: true
      }
    ].map((r) => ({ ...r, monthly: r.perMillion * tokensM + r.fixed })) as CostRow[];
  }, [monthlyTokens, users, onPrem]);

  const max = Math.max(...rows.map((r) => r.perMillion * monthlyTokens + r.fixed));
  const frontierTotal =
    FRONTIER_PRICING_PER_MTOK * monthlyTokens + Math.max(0, users - 10) * 1500;
  const customTotal =
    CUSTOM_SLM_PRICING_PER_MTOK * monthlyTokens +
    (onPrem ? 0 : CUSTOM_SLM_FIXED_INFRA_INR);
  const savings = Math.max(0, frontierTotal - customTotal);
  const savingsPct =
    frontierTotal > 0 ? Math.round((savings / frontierTotal) * 100) : 0;

  return (
    <section className="py-20 sm:py-28">
      <div className="container-px">
        <div className="card overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-12">
            <div className="space-y-6 border-b border-white/10 p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
              <div>
                <span className="eyebrow">
                  <IndianRupee className="h-3.5 w-3.5" /> TCO calculator
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">
                  What does private actually cost?
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Live monthly cost across the three options. Tweak the sliders to see when a
                  fine-tune pays for itself.
                </p>
              </div>

              <div className="space-y-5">
                <Slider
                  label="Monthly tokens"
                  value={monthlyTokens}
                  min={1}
                  max={500}
                  step={1}
                  unit="M"
                  hint={`${compact.format(monthlyTokens * 1_000_000)} tokens / month`}
                  onChange={setMonthlyTokens}
                />
                <Slider
                  label="Active users"
                  value={users}
                  min={5}
                  max={500}
                  step={5}
                  unit=""
                  hint={`${users} seats`}
                  onChange={setUsers}
                />
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 p-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Custom SLM hosting
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {onPrem ? "Runs on your CPU servers" : "Managed by Evarx in your VPC"}
                    </p>
                  </div>
                  <Toggle on={onPrem} onChange={setOnPrem} labelOn="On-prem" labelOff="Managed" />
                </div>
              </div>

              <div className="rounded-2xl border border-helix-400/30 bg-helix-500/[0.06] p-5">
                <div className="flex items-center gap-2 text-helix-200">
                  <TrendingDown className="h-4 w-4" />
                  <p className="text-xs font-medium uppercase tracking-wider">
                    Custom vs Frontier
                  </p>
                </div>
                <p className="mt-3 font-display text-3xl font-semibold text-white">
                  {inr.format(savings)}
                  <span className="ml-2 text-sm font-normal text-helix-300">
                    saved / month
                  </span>
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  ≈ {savingsPct}% lower than running everything on a frontier hosted API.
                </p>
              </div>
            </div>

            <div className="p-8 lg:col-span-7">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Monthly cost · INR
                </p>
                <p className="text-[11px] text-zinc-500">
                  Indicative. Actuals depend on volume and contract.
                </p>
              </div>

              <ul className="mt-6 space-y-4">
                {rows.map((r, i) => {
                  const total = r.perMillion * monthlyTokens + r.fixed;
                  const pct = max === 0 ? 0 : Math.round((total / max) * 100);
                  return (
                    <li
                      key={r.name}
                      className={cn(
                        "rounded-xl border p-4",
                        r.highlight
                          ? "border-helix-400/30 bg-helix-500/[0.05]"
                          : "border-white/10 bg-white/[0.02]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg",
                              r.highlight
                                ? "bg-helix-500/20 text-helix-200"
                                : "bg-white/5 text-zinc-300"
                            )}
                          >
                            <r.icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{r.name}</p>
                            <p className="text-[11px] text-zinc-500">{r.hint}</p>
                          </div>
                        </div>
                        <p className="font-display text-lg font-semibold text-white">
                          {inr.format(total)}
                        </p>
                      </div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          key={pct + r.name}
                          className={cn(
                            "h-full rounded-full",
                            r.highlight
                              ? "bg-gradient-to-r from-helix-400 to-plasma-400"
                              : "bg-zinc-500/70"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
                        <span>{inr.format(r.perMillion)} / 1M tokens</span>
                        <span>{r.fixed > 0 ? `+ ${inr.format(r.fixed)} fixed` : "no fixed cost"}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 p-4 text-xs text-zinc-400">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-helix-300" />
                  Custom-tier on-prem deployments hit cost-parity within ~3 months at this volume.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </label>
        <span className="font-mono text-sm text-white">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-helix-400"
      />
      <p className="mt-1 text-[11px] text-zinc-500">{hint}</p>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  labelOn,
  labelOff
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative inline-flex h-7 w-32 items-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] font-medium uppercase tracking-wider"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute inset-y-0 w-1/2 rounded-full",
          on ? "left-0 bg-helix-500/30" : "left-1/2 bg-plasma-500/30"
        )}
      />
      <span
        className={cn(
          "relative z-10 flex w-1/2 justify-center",
          on ? "text-helix-200" : "text-zinc-400"
        )}
      >
        {labelOn}
      </span>
      <span
        className={cn(
          "relative z-10 flex w-1/2 justify-center",
          !on ? "text-plasma-200" : "text-zinc-400"
        )}
      >
        {labelOff}
      </span>
    </button>
  );
}
