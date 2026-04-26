import { cn } from "@/lib/cn";

/**
 * Site logo. Uses the brand PNG with a CSS filter that flattens it to a white
 * silhouette so the original design (medical cross + circuit + face + EVARX
 * wordmark) reads cleanly against the dark theme. The PNG itself has a
 * transparent background after pre-processing.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label="Evarx"
    >
      <img
        src="/evarx-logo.png"
        alt="Evarx"
        className="h-9 w-auto select-none brightness-0 invert drop-shadow-[0_0_18px_rgba(16,185,129,0.25)]"
        draggable={false}
      />
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/evarx-logo.png"
      alt=""
      aria-hidden="true"
      className={cn(
        "w-auto select-none object-contain brightness-0 invert",
        className
      )}
      draggable={false}
    />
  );
}
