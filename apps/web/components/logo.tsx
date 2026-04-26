import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-white",
        className
      )}
    >
      <LogoMark className="h-7 w-7" />
      Evarx
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="evx-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B4DFF" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#evx-g)" />
      <path
        d="M9 22c2.5-3.5 4-5.5 7-5.5s4.5 2 7 5.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M9 12c2.5 3.5 4 5.5 7 5.5s4.5-2 7-5.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx="16" cy="16" r="1.6" fill="white" />
    </svg>
  );
}
