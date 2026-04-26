import { ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
}

export function KpiCard({ label, value, delta, trend }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{value}</p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-xs",
          trend === "up" && "text-helix-300",
          trend === "down" && "text-rose-300",
          trend === "neutral" && "text-zinc-400"
        )}
      >
        {trend === "neutral" ? <Minus className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
        {delta}
      </p>
    </div>
  );
}
