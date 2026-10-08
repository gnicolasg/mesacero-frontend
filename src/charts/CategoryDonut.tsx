import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { eur, pct } from "@/lib/format";
import type { CategoriaIngresos } from "@/lib/horeca/types";
import { tipBox } from "./ChartCard";

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

export function CategoryDonut({ categorias }: { categorias: CategoriaIngresos[] }) {
  const [seleccion, setSeleccion] = useState(0);
  const data = categorias.map((categoria) => ({
    categoria: categoria.categoria,
    valor: categoria.ventas,
    mix: categoria.mix_pct,
  }));
  const total = data.reduce((suma, categoria) => suma + categoria.valor, 0);
  const usaMix = data.some((categoria) => categoria.mix > 0);
  const indice = seleccion < data.length ? seleccion : 0;
  const activa = data[indice];
  if (!activa || total <= 0) return null;

  return (
    <div className="flex h-full min-w-0 flex-col items-center gap-1 md:flex-row md:gap-2 lg:max-xl:gap-1">
      <div className="relative h-[190px] w-full min-w-0 shrink-0 md:h-full md:w-[49%] lg:max-xl:w-[43%]">
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              dataKey="valor"
              nameKey="categoria"
              innerRadius="57%"
              outerRadius="82%"
              activeIndex={indice}
              stroke="var(--surface)"
              strokeWidth={2}
              onClick={(_, siguiente) => setSeleccion(siguiente)}
            >
              {data.map((categoria, posicion) => (
                <Cell
                  key={categoria.categoria}
                  fill={colorEn(posicion)}
                  className="cursor-pointer outline-none transition-opacity duration-200"
                  opacity={posicion === indice ? 1 : 0.7}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.[0] ? (
                  <div className={tipBox}>
                    <p className="font-semibold">{payload[0].payload.categoria}</p>
                    <p>
                      {eur(payload[0].payload.valor)} ·{" "}
                      {pct(
                        usaMix ? payload[0].payload.mix : (payload[0].payload.valor / total) * 100,
                      )}
                    </p>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-lg font-extrabold tabular-nums text-foreground md:text-base">
            {pct(usaMix ? activa.mix : (activa.valor / total) * 100)}
          </strong>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {activa.categoria}
          </span>
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-1 flex-col justify-center gap-0.5 lg:max-xl:gap-0">
        <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground lg:max-xl:mb-0">
          Ingresos por categoría
        </p>
        {data.map((categoria, posicion) => (
          <Button
            key={categoria.categoria}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSeleccion(posicion)}
            aria-pressed={indice === posicion}
            aria-label={`${categoria.categoria}: ${eur(categoria.valor)}, ${pct(usaMix ? categoria.mix : (categoria.valor / total) * 100)}`}
            className={`h-9 w-full min-w-0 justify-start gap-2 px-2 text-xs font-medium sm:h-10 md:h-9 lg:max-xl:h-6 lg:max-xl:min-h-0 lg:max-xl:px-1 lg:max-xl:text-[10px] ${indice === posicion ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colorEn(posicion) }}
            />
            <span className="min-w-0 flex-1 truncate text-left">{categoria.categoria}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {pct(usaMix ? categoria.mix : (categoria.valor / total) * 100)}
            </span>
            <span className="shrink-0 tabular-nums text-foreground">{eur(categoria.valor, 0)}</span>
          </Button>
        ))}
        <div className="mt-1 flex items-center justify-between border-t pt-2 text-xs font-semibold text-foreground lg:max-xl:mt-0 lg:max-xl:pt-1 lg:max-xl:text-[10px]">
          <span>Total</span>
          <span className="tabular-nums">{eur(total)}</span>
        </div>
      </div>
    </div>
  );
}
