"use client";

import { usePathname } from "next/navigation";

/**
 * Animated brand background — drifting aurora orbs, a slow rotating conic
 * sweep, a faintly moving grid, and a noise grain. Pure CSS, GPU-accelerated.
 * Hidden on /console (the dashboard chrome covers the viewport).
 *
 * Honours prefers-reduced-motion via `motion-safe:` — orbs/grid still render
 * for the brand look, they just sit still when reduced motion is requested.
 */
export function LiveBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/console")) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Slow rotating conic sweep — gives the whole canvas a quiet spin */}
      <div
        className="absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.35] motion-safe:animate-orbit"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(16,185,129,0.10) 0deg, transparent 60deg, rgba(59,77,255,0.10) 180deg, transparent 240deg, rgba(16,185,129,0.10) 360deg)"
        }}
      />

      {/* Drifting aurora orbs */}
      <div className="absolute -left-32 -top-40 h-[42rem] w-[42rem] rounded-full bg-helix-500/20 blur-[120px] motion-safe:animate-aurora-slow" />
      <div className="absolute right-[-12rem] top-[14%] h-[40rem] w-[40rem] rounded-full bg-plasma-500/18 blur-[120px] motion-safe:animate-aurora-medium" />
      <div className="absolute bottom-[-14rem] left-[12%] h-[36rem] w-[36rem] rounded-full bg-cyan-500/14 blur-[120px] motion-safe:animate-aurora-fast" />
      <div className="absolute bottom-[6%] right-[8%] h-[28rem] w-[28rem] rounded-full bg-helix-400/12 blur-[110px] motion-safe:animate-aurora-medium" />

      {/* Faint drifting grid — gives parallax-y depth */}
      <div className="grid-bg absolute inset-0 opacity-[0.35] motion-safe:animate-grid-drift" />

      {/* Subtle noise grain — kills banding, adds texture */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-soft-light bg-noise" />

      {/* Vignette so edges fade into ink and content stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(5,6,15,0.85))]" />
    </div>
  );
}
