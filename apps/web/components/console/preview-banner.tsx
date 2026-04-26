import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

/**
 * Thin banner pinned to the very top of the console layout. Communicates
 * that this is a live preview of the dashboard and gives a one-click route
 * back to the marketing site. Replace with a real "Switch tenant" or
 * environment indicator (staging / prod) once auth is wired in.
 */
export function PreviewBanner() {
  return (
    <div className="border-b border-helix-400/20 bg-gradient-to-r from-helix-500/[0.08] via-plasma-500/[0.06] to-helix-500/[0.08]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-6 py-2 text-xs">
        <div className="flex items-center gap-2 text-helix-200">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-medium">Live preview</span>
          <span className="hidden text-helix-300/70 sm:inline">
            · interactive demo of the Evarx customer console
          </span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to evarx.in
        </Link>
      </div>
    </div>
  );
}
