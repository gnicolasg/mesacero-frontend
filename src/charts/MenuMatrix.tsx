import {
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { eur, int, pct } from "@/lib/format";
import { etiquetaMenu } from "@/lib/horeca/labels";
import type { ClaseMenu, PlatoMenu } from "@/lib/horeca/types";
import { axis, axisLabel, tipBox } from "./ChartCard";

const COLORES: Record<ClaseMenu, string> = {
  STAR: "var(--q-estrella)",
  PLOWHORSE: "var(--q-caballo)",
  PUZZLE: "var(--q-rompecabezas)",
  DOG: "var(--q-perro)",
  UNCLASSIFIED: "var(--chart-muted)",
};

const LECTURAS = [
  { clase: "STAR" as const, texto: "Potenciar: alta venta y margen" },
  { clase: "PLOWHORSE" as const, texto: "Revisar margen: se vende mucho" },
  { clase: "PUZZLE" as const, texto: "Dar visibilidad: buen margen" },
  { clase: "DOG" as const, texto: "Replantear: baja venta y margen" },
];

function media(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((suma, valor) => suma + valor, 0) / valores.length;
}

export function MenuMatrix({ menu }: { menu: PlatoMenu[] }) {
  const puntos = menu.map((plato) => ({
    producto: plato.producto,
    unidades: plato.unidades_vendidas,
    margenUnit: plato.margen_unitario,
    beneficio: plato.beneficio_bruto,
    ventas: plato.ventas_totales,
    clase: plato.clasificacion,
    foodCost: plato.food_cost_pct,
    contribucion: plato.contribucion_pct,
  }));
  const mediaU = media(puntos.map((punto) => punto.unidades));
  const mediaM = media(puntos.map((punto) => punto.margenUnit));
  const maximo = Math.max(0, ...puntos.map((punto) => punto.margenUnit));
  const techo = maximo <= 0 ? 1 : Math.ceil(maximo * 1.15);

  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
        Cada punto es un plato. Más a la derecha = más ventas; más arriba = más margen por unidad.
        El tamaño indica beneficio bruto.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <ScatterChart margin={{ left: 12, right: 16, top: 12, bottom: 22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="unidades"
              tick={axis}
              stroke="var(--border)"
              label={{
                value: "Popularidad (unidades)",
                position: "insideBottom",
                offset: -10,
                ...axisLabel,
              }}
            />
            <YAxis
              type="number"
              dataKey="margenUnit"
              tick={axis}
              stroke="var(--border)"
              width={56}
              domain={[0, techo]}
              tickFormatter={(v) => `${v} €`}
              label={{
                value: "Margen unitario (€)",
                angle: -90,
                position: "insideLeft",
                offset: 4,
                style: { textAnchor: "middle" },
                ...axisLabel,
              }}
            />
            <ZAxis type="number" dataKey="beneficio" range={[80, 900]} />
            <ReferenceArea
              x1={mediaU}
              y1={mediaM}
              fill="var(--q-estrella)"
              fillOpacity={0.05}
              stroke="none"
              ifOverflow="extendDomain"
              label={{
                value: "Estrella",
                position: "insideTopRight",
                fontSize: 10,
                fontWeight: 700,
                fill: "var(--q-estrella)",
              }}
            />
            <ReferenceArea
              x1={mediaU}
              y2={mediaM}
              fill="var(--q-caballo)"
              fillOpacity={0.05}
              stroke="none"
              ifOverflow="extendDomain"
              label={{
                value: "Caballo",
                position: "insideBottomRight",
                fontSize: 10,
                fontWeight: 700,
                fill: "var(--q-caballo)",
              }}
            />
            <ReferenceArea
              x2={mediaU}
              y1={mediaM}
              fill="var(--q-rompecabezas)"
              fillOpacity={0.05}
              stroke="none"
              ifOverflow="extendDomain"
              label={{
                value: "Rompecabezas",
                position: "insideTopLeft",
                fontSize: 10,
                fontWeight: 700,
                fill: "var(--q-rompecabezas)",
              }}
            />
            <ReferenceArea
              x2={mediaU}
              y2={mediaM}
              fill="var(--q-perro)"
              fillOpacity={0.05}
              stroke="none"
              ifOverflow="extendDomain"
              label={{
                value: "Perro",
                position: "insideBottomLeft",
                fontSize: 10,
                fontWeight: 700,
                fill: "var(--q-perro)",
              }}
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              x={mediaU}
              stroke="var(--chart-muted)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              ifOverflow="extendDomain"
              y={mediaM}
              stroke="var(--chart-muted)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const punto = active ? payload?.[0]?.payload : null;
                if (!punto) return null;
                return (
                  <div className={tipBox}>
                    <p className="mb-1 font-semibold">{punto.producto}</p>
                    <p>Clasificación: {etiquetaMenu(punto.clase)}</p>
                    <p>Unidades: {int(punto.unidades)}</p>
                    <p>Margen unitario: {eur(punto.margenUnit)}</p>
                    <p>Beneficio bruto: {eur(punto.beneficio)}</p>
                    <p>Ventas: {eur(punto.ventas)}</p>
                    {punto.foodCost != null && <p>Food cost: {pct(punto.foodCost)}</p>}
                    {punto.contribucion != null && <p>Contribución: {pct(punto.contribucion)}</p>}
                  </div>
                );
              }}
            />
            <Scatter data={puntos} fillOpacity={0.9}>
              {puntos.map((punto, indice) => (
                <Cell
                  key={`${punto.producto}-${indice}`}
                  fill={COLORES[punto.clase]}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1 border-t pt-2 sm:grid-cols-2">
        {LECTURAS.map((item) => (
          <div key={item.clase} className="flex min-w-0 items-start gap-2 text-[11px] leading-snug">
            <span
              className="mt-1 size-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORES[item.clase] }}
            />
            <span className="text-muted-foreground">
              <strong className="text-foreground">{etiquetaMenu(item.clase)}</strong> · {item.texto}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
