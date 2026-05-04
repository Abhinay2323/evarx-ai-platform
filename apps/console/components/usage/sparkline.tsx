import type { DailyPoint } from "@/lib/types";

interface Props {
  points: DailyPoint[];
  width?: number;
  height?: number;
}

export function Sparkline({ points, width = 600, height = 120 }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-zinc-600">
        No data yet.
      </div>
    );
  }

  const max = Math.max(1, ...points.map((p) => p.count));
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const padY = 8;

  const path = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - padY - ((p.count / max) * (height - padY * 2));
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPath = `${path} L${(points.length - 1) * stepX},${height} L0,${height} Z`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-32 w-full"
        role="img"
        aria-label="Daily query volume"
      >
        <defs>
          <linearGradient id="usage-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22C48A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#22C48A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#usage-fill)" />
        <path d={path} stroke="#22C48A" strokeWidth="1.5" fill="none" />
        {points.map((p, i) => {
          if (p.count === 0) return null;
          const x = i * stepX;
          const y = height - padY - ((p.count / max) * (height - padY * 2));
          return (
            <circle
              key={p.date}
              cx={x}
              cy={y}
              r="2"
              fill="#22C48A"
              className="opacity-80"
            >
              <title>
                {new Date(p.date).toLocaleDateString()}: {p.count}
              </title>
            </circle>
          );
        })}
      </svg>

      <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
        <span>{new Date(points[0].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <span>{new Date(points[points.length - 1].date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}
