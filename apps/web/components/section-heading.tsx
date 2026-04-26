import { cn } from "@/lib/cn";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, body, align = "left", className }: Props) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="heading-section mt-5">{title}</h2>
      {body ? <p className="lede mt-5">{body}</p> : null}
    </div>
  );
}
