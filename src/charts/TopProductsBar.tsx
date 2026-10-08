import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { eur, int } from "@/lib/format";
import type { ProductoIngresos } from "@/lib/horeca/types";
import { axis, tipBox } from "./ChartCard";

const COLORES = [
  "var(--cat-1)",
  "var(--cat-2)",
  "var(--cat-3)",
  "var(--cat-4)",
  "var(--cat-5)",
] as const;

function colorEn(indice: number): string {
  return COLORES[indice % COLORES.length] ?? COLORES[0];
}

export function TopProductsBar({ productos }: { productos: ProductoIngresos[] }) {
  const data = [...productos]
    .sort((a, b) => b.ventas - a.ventas)
    .map((producto) => ({ producto: producto.producto, ingresos: producto.ventas }));
  const maxIngresos = Math.max(1, ...data.map((producto) => producto.ingresos));

  return (
    <>
      <div className="flex h-full flex-col justify-around py-1 sm:hidden sm:max-[1439px]:flex lg:max-[1439px]:py-0">
        {data.map((producto, indice) => (
          <div
            key={producto.producto}
            className="flex min-w-0 items-center gap-2 text-[11px] lg:max-[1439px]:gap-1 lg:max-[1439px]:text-[10px] lg:max-[1439px]:leading-none"
          >
            <span className="w-[44%] min-w-0 shrink-0 text-right leading-tight text-chart-muted lg:max-[1439px]:w-[50%] lg:max-[1439px]:truncate">
              {producto.producto}
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="h-2.5 rounded-full"
                style={{
                  width: `${(producto.ingresos / maxIngresos) * 100}%`,
                  backgroundColor: colorEn(indice),
                }}
              />
            </div>
            <span className="w-[58px] shrink-0 text-right font-bold tabular-nums text-chart-text">
              {int(producto.ingresos)} €
            </span>
          </div>
        ))}
      </div>
      <div className="hidden h-full min-[1440px]:block">
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <BarChart
            data={data}
            layout="vertical"
            barCategoryGap="34%"
            margin={{ left: 16, right: 68, top: 8, bottom: 8 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="producto"
              tick={{ ...axis, fontWeight: 500 }}
              stroke="none"
              width={154}
              tickMargin={8}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div className={tipBox}>
                    <p className="flex items-center gap-2 font-semibold">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: colorEn(data.indexOf(payload[0].payload)) }}
                      />
                      {payload[0].payload.producto}
                    </p>
                    <p>Ingresos: {eur(payload[0].payload.ingresos)}</p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="ingresos" maxBarSize={14} radius={[99, 99, 99, 99]}>
              {data.map((producto, indice) => (
                <Cell key={producto.producto} fill={colorEn(indice)} />
              ))}
              <LabelList
                dataKey="ingresos"
                position="right"
                formatter={(v: unknown) => `${int(Number(v))} €`}
                style={{ fill: "var(--chart-text)", fontSize: 11, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
