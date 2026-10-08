import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { eur, fechaCorta, fechaLarga, int } from "@/lib/format";
import { axis } from "./ChartCard";

export function RevenueArea({ serie }: { serie: { t: number; ventas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={240}>
      <AreaChart data={serie} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="t" tickFormatter={(t) => fechaCorta(new Date(t))} tick={axis} axisLine={false} tickLine={false} minTickGap={18} />
        <YAxis tick={axis} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => `${int(v)} €`} />
        <Tooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          content={({ active, payload }) =>
            active && payload?.[0] ? (
              <div className="rounded-lg border border-tooltip-border bg-tooltip p-3 shadow-md">
                <p className="text-sm text-muted-foreground">{fechaLarga(new Date(payload[0].payload.t))}</p>
                <p className="text-lg font-bold tabular-nums text-tooltip-foreground">{eur(payload[0].payload.ventas)}</p>
              </div>
            ) : null
          }
        />
        <Area
          type="monotone"
          dataKey="ventas"
          stroke="var(--brand)"
          strokeWidth={2.5}
          fill="url(#colorVentas)"
          activeDot={{ r: 6, fill: "var(--surface)", stroke: "var(--brand)", strokeWidth: 2, style: { filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" } }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
