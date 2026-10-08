import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { eur, int } from "@/lib/format";
import { DIAS, etiquetaAfluencia } from "@/lib/horeca/labels";
import type { Afluencia } from "@/lib/horeca/types";
import { axis, tipBox } from "./ChartCard";

function textoAfluencia(metrica: Afluencia["metrica"], valor: number) {
  return metrica === "REVENUE" ? eur(valor, 0) : int(Math.round(valor));
}

export function AffluenceGrid({ afluencia }: { afluencia: Afluencia }) {
  const horas = [
    ...new Set(afluencia.celdas.flatMap((celda) => (celda.hora == null ? [] : [celda.hora]))),
  ].sort((a, b) => a - b);
  if (horas.length === 0) return null;

  const valores = new Map<string, number>(
    afluencia.celdas.flatMap((celda) =>
      celda.hora == null ? [] : [[`${celda.dia}-${celda.hora}`, celda.valor]],
    ),
  );
  const maximo = Math.max(1, ...valores.values());
  const etiqueta = etiquetaAfluencia(afluencia.metrica);
  const texto = (valor: number) => textoAfluencia(afluencia.metrica, valor);
  const columnas = {
    gridTemplateColumns: `84px repeat(${horas.length}, minmax(0, 1fr))`,
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="overflow-x-auto">
        <div
          className="px-2 pb-1 pt-0 lg:pb-0"
          style={{ minWidth: Math.max(560, 84 + horas.length * 36) }}
        >
          <div
            className="mb-0.5 grid gap-1 text-center text-xs text-muted-foreground lg:mb-0"
            style={columnas}
          >
            <span className="sticky left-0 z-10 bg-surface/95 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur" />
            {horas.map((hora) => (
              <span key={hora}>{hora}h</span>
            ))}
          </div>
          {DIAS.map((dia, indice) => (
            <div key={dia} className="mt-1 grid items-center gap-1" style={columnas}>
              <span className="sticky left-0 z-10 flex items-center self-stretch bg-surface/95 text-xs text-muted-foreground shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur">
                {dia}
              </span>
              {horas.map((hora) => {
                const valor = valores.get(`${indice}-${hora}`) ?? 0;
                const peso = Math.round((valor / maximo) * 100);
                return (
                  <Tooltip key={hora}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex h-[22px] cursor-default items-center justify-center overflow-hidden rounded-md text-[11px] font-medium tabular-nums transition-transform hover:scale-110 hover:ring-2 hover:ring-brand min-[1440px]:h-6"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--heat-hi) ${peso}%, var(--heat-lo))`,
                          color: peso > 55 ? "var(--heat-lo)" : "var(--heat-hi)",
                        }}
                      >
                        {texto(valor)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">
                        {dia} · {hora}h
                      </p>
                      <p>
                        {etiqueta}: {texto(valor)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function AffluenceByDay({ afluencia }: { afluencia: Afluencia }) {
  const etiqueta = etiquetaAfluencia(afluencia.metrica);
  const data = DIAS.map((dia, indice) => ({
    dia,
    valor: afluencia.celdas
      .filter((celda) => celda.dia === indice)
      .reduce((suma, celda) => suma + celda.valor, 0),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={220}>
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="dia" tick={axis} stroke="var(--border)" />
        <YAxis
          tick={axis}
          stroke="var(--border)"
          width={64}
          tickFormatter={(valor) => textoAfluencia(afluencia.metrica, Number(valor))}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            const punto = active ? payload?.[0]?.payload : null;
            if (!punto) return null;
            return (
              <div className={tipBox}>
                <p className="mb-1 font-semibold">{punto.dia}</p>
                <p>
                  {etiqueta}: {textoAfluencia(afluencia.metrica, punto.valor)}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="valor" fill="var(--brand)" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
