import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, icon, actions }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-helix-500/10 to-plasma-500/10 p-2 text-helix-300">
            {icon}
          </div>
        ) : null}
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-2xl font-display font-bold tracking-tight text-white sm:text-[28px]">
            {title}
          </h1>
          {description ? (
            <div className="mt-1.5 max-w-2xl text-sm text-zinc-400">
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
