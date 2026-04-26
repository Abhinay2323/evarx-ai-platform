import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label="Evarx"
    >
      <img
        src="/evarx-logo.png"
        alt="Evarx"
        className="h-9 w-auto select-none"
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
      className={cn("w-auto select-none object-contain", className)}
      draggable={false}
    />
  );
}
