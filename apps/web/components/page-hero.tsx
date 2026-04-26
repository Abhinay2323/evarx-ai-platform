import { cn } from "@/lib/cn";

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  blurb: React.ReactNode;
  align?: "left" | "center";
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, blurb, align = "left", children }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div className="absolute inset-0 -z-10 bg-grid-fade" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-[0.3] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
      <div className={cn("container-px", align === "center" && "text-center")}>
        <span className="eyebrow">{eyebrow}</span>
        <h1
          className={cn(
            "heading-display mt-5 max-w-3xl",
            align === "center" && "mx-auto"
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "lede mt-5 max-w-2xl",
            align === "center" && "mx-auto"
          )}
        >
          {blurb}
        </p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
