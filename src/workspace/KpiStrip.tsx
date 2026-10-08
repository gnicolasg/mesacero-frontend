import { useId } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export type Kpi = {
  label: string;
  valor: string;
  tendencia?: number;
  spark?: number[];
  nota?: string;
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <ResponsiveContainer width="100%" height={22}>
      <AreaChart
        data={data.map((v, i) => ({ i, v }))}
        margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`sp${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#sp${id})`}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function KpiStrip({ kpis, loading = false }: { kpis: Kpi[]; loading?: boolean }) {
  const columnas =
    kpis.length > 8
      ? "lg:grid-cols-4 xl:grid-cols-5"
      : kpis.length >= 5
        ? "lg:grid-cols-5"
        : "lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 gap-2 max-md:gap-3 sm:grid-cols-2 ${columnas}`}>
      {kpis.map((k) => {
        if (loading)
          return (
            <div key={k.label} className="space-y-1.5 rounded-2xl border bg-surface p-3">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-8 w-full" />
            </div>
          );
        const tieneTendencia = k.tendencia !== undefined;
        const up = tieneTendencia && (k.tendencia ?? 0) >= 0;
        const color = !tieneTendencia ? "var(--brand)" : up ? "var(--good)" : "var(--critical)";
        const Icon = up ? TrendingUp : TrendingDown;
        return (
          <div
            key={k.label}
            className="kpi-card flex min-w-0 flex-col rounded-xl border bg-surface p-3 pb-2 shadow-card lg:px-3 lg:py-2 lg:pb-1.5"
          >
            <p className="kpi-label">{k.label}</p>
            <p className="kpi-value mt-0.5">{k.valor}</p>
            {tieneTendencia && (
              <p
                className="mt-0.5 flex items-center gap-1 text-[0.7rem] font-semibold tabular-nums"
                style={{ color }}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {`${up ? "+" : ""}${k.tendencia?.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% vs sem. ant.`}
              </p>
            )}
            {k.nota && <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{k.nota}</p>}
            {k.spark && k.spark.length > 1 && (
              <div className="mt-auto pt-0.5" aria-hidden>
                <Sparkline data={k.spark} color={color} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
