"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { usageSeries } from "@/lib/console-mock";

const W = 640;
const H = 180;
const PAD = 24;

export function UsageChart() {
  const { line, area, points, max } = useMemo(() => {
    const max = Math.max(...usageSeries) * 1.15;
    const stepX = (W - PAD * 2) / (usageSeries.length - 1);
    const points = usageSeries.map((v, i) => ({
      x: PAD + i * stepX,
      y: H - PAD - (v / max) * (H - PAD * 2)
    }));
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${points[points.length - 1].x} ${H - PAD} L ${PAD} ${H - PAD} Z`;
    return { line, area, points, max };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Token usage · 14 days</p>
          <p className="mt-1 text-xs text-zinc-500">Across all workflows · millions of tokens</p>
        </div>
        <span className="rounded-full border border-helix-400/30 bg-helix-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-helix-200">
          Trending up
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 w-full" role="img" aria-label="Token usage trend">
        <defs>
          <linearGradient id="evx-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3A0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22D3A0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="evx-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3A0" />
            <stop offset="100%" stopColor="#5C6EFF" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + (H - PAD * 2) * t}
            y2={PAD + (H - PAD * 2) * t}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="3 4"
          />
        ))}

        <motion.path
          d={area}
          fill="url(#evx-area)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#evx-line)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 2.5}
            fill={i === points.length - 1 ? "#22D3A0" : "rgba(255,255,255,0.6)"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * i + 0.6 }}
          />
        ))}

        <text x={PAD} y={H - 6} fontSize="10" fill="rgba(255,255,255,0.35)" fontFamily="monospace">
          14d ago
        </text>
        <text x={W - PAD} y={H - 6} fontSize="10" fill="rgba(255,255,255,0.35)" fontFamily="monospace" textAnchor="end">
          today
        </text>
        <text x={W - PAD - 4} y={points[points.length - 1].y - 8} fontSize="11" fill="#22D3A0" fontFamily="monospace" textAnchor="end">
          {usageSeries[usageSeries.length - 1]}M
        </text>
      </svg>

      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Max scaled to {max.toFixed(1)}M</span>
        <span>Updated 2 min ago</span>
      </div>
    </div>
  );
}
