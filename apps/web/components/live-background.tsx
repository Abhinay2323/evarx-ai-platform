"use client";

import { usePathname } from "next/navigation";

/**
 * Drifting aurora orbs behind the marketing site. Pure CSS — three blurred
 * gradient circles slowly translating in opposite directions. Hidden on the
 * /console route since the dashboard chrome covers the viewport with an
 * opaque background and the orbs would never be seen anyway.
 *
 * Honours prefers-reduced-motion via Tailwind's `motion-safe:` modifier —
 * the orbs still render (they're part of the brand look) but they sit still.
 */
export function LiveBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/console")) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* helix orb — top-left, the slowest drift */}
      <div className="absolute -left-32 -top-40 h-[42rem] w-[42rem] rounded-full bg-helix-500/15 blur-[120px] motion-safe:animate-aurora-slow" />
      {/* plasma orb — right side, mid-tempo */}
      <div className="absolute right-[-12rem] top-[18%] h-[38rem] w-[38rem] rounded-full bg-plasma-500/12 blur-[120px] motion-safe:animate-aurora-medium" />
      {/* cyan accent — bottom-left, fastest */}
      <div className="absolute bottom-[-14rem] left-[15%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[120px] motion-safe:animate-aurora-fast" />
      {/* vignette so edges fade into ink */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_55%,_rgba(5,6,15,0.7))]" />
    </div>
  );
}
