"use client";

import { motion } from "framer-motion";

export function HelixVisual() {
  const rungs = Array.from({ length: 14 });
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-plasma-600/20 via-helix-500/10 to-transparent blur-2xl" />
      <div className="card relative h-full w-full overflow-hidden rounded-[28px] p-0">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,77,255,0.25),transparent_60%)]" />
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="strand-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3A0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#22D3A0" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="strand-b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5C6EFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#5C6EFF" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          <motion.path
            d="M 130 30 C 270 110, 130 190, 270 270 S 130 350, 270 430"
            stroke="url(#strand-a)"
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M 270 30 C 130 110, 270 190, 130 270 S 270 350, 130 430"
            stroke="url(#strand-b)"
            strokeWidth="2.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
          />

          {rungs.map((_, i) => {
            const t = i / (rungs.length - 1);
            const y = 50 + t * 320;
            const phase = Math.sin(t * Math.PI * 4);
            const x1 = 200 - phase * 70;
            const x2 = 200 + phase * 70;
            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.05 }}
              />
            );
          })}

          {[0.15, 0.35, 0.55, 0.75].map((t, i) => {
            const phase = Math.sin(t * Math.PI * 4);
            const cx = 200 + phase * 70;
            const cy = 50 + t * 320;
            return (
              <g key={i}>
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="#22D3A0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + i * 0.15 }}
                />
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="9"
                  fill="none"
                  stroke="#22D3A0"
                  strokeOpacity="0.6"
                  initial={{ scale: 0.95, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: 1.2 + i * 0.3
                  }}
                  style={{ originX: `${cx}px`, originY: `${cy}px` }}
                />
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-zinc-300 backdrop-blur">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full bg-helix-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-helix-400" />
            </span>
            Evarx Medical SLM · live
          </span>
          <span className="font-mono text-zinc-400">v0.4.2 · CPU</span>
        </div>
      </div>
    </div>
  );
}
