import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { eur, int, pct } from "@/lib/format";
import type { ZonaIngresos } from "@/lib/horeca/types";
import { axis, axisLabel, cyan, tipBox } from "./ChartCard";

export function ZoneBar({ zonas }: { zonas: ZonaIngresos[] }) {
  const data = [...zonas]
    .sort((a, b) => b.ventas - a.ventas)
    .map((zona) => ({
      zona: zona.zona,
      ventas: zona.ventas,
      mix: zona.mix_pct,
    }));
  const minimo = Math.min(...data.map((zona) => zona.ventas));
  const maximo = Math.max(...data.map((zona) => zona.ventas));
  const techo = Math.max(1, Math.ceil(maximo * 1.08));

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={0}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 44, top: 6, bottom: 22 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={axis}
          stroke="var(--border)"
          domain={[0, techo]}
          tickFormatter={(v) => `${int(v)} €`}
          label={{ value: "Ventas (€)", position: "insideBottom", offset: -10, ...axisLabel }}
        />
        <YAxis
          type="category"
          dataKey="zona"
          tick={axis}
          stroke="var(--border)"
          width={88}
          label={{ value: "Zona", angle: -90, position: "insideLeft", ...axisLabel }}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            const punto = active ? payload?.[0]?.payload : null;
            if (!punto) return null;
            return (
              <div className={tipBox}>
                <p className="mb-1 font-semibold">{punto.zona}</p>
                <p>Ventas: {eur(punto.ventas)}</p>
                <p>Mix: {pct(punto.mix)}</p>
              </div>
            );
          }}
        />
        <Bar dataKey="ventas" maxBarSize={40} radius={[0, 6, 6, 0]}>
          {data.map((zona) => (
            <Cell key={zona.zona} fill={cyan(zona.ventas, minimo, maximo)} />
          ))}
          <LabelList
            dataKey="ventas"
            position="right"
            offset={8}
            formatter={(v: unknown) => `${int(Math.round(Number(v)))} €`}
            style={{ fontSize: 11, fontWeight: 600, fill: "var(--chart-text)" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
