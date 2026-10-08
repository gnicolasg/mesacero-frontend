import type { ReactNode } from "react";

export const axis = { fontSize: 11, fill: "var(--chart-muted)" };
export const axisLabel = { fill: "var(--chart-muted)", fontSize: 11 };
export const tipBox =
  "rounded-lg border border-tooltip-border bg-tooltip px-3 py-2 text-xs text-tooltip-foreground shadow-md";

/** Cyan scale shared by waiter and channel charts */
export const cyan = (v: number, min: number, max: number) =>
  `color-mix(in srgb, var(--cyan-hi) ${Math.round(25 + ((v - min) / (max - min || 1)) * 75)}%, var(--cyan-lo))`;

export function ChartCard({ title, badge, children, className = "" }: { title: string; badge?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col rounded-xl border bg-surface p-3 shadow-card lg:p-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-chart-text">{title}</h3>
        {badge}
      </div>
      <div className="mt-2 min-h-0 flex-1">{children}</div>
    </div>
  );
}
