import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DIAS, ETIQUETAS_TURNO, etiquetaTurno } from "@/lib/horeca/labels";
import type { PlanTurnos, PresionTurno } from "@/lib/horeca/types";

const FINDE = [5, 6];
const COLORES: Record<PresionTurno, string> = {
  PEAK: "var(--st-peak)",
  BASE: "var(--st-base)",
  VALLEY: "var(--st-valley)",
  NO_DATA: "var(--chart-muted)",
};
const LEYENDA: PresionTurno[] = ["PEAK", "BASE", "VALLEY"];

export function ShiftGrid({ turnos }: { turnos: PlanTurnos }) {
  const horas = [...new Set(turnos.tramos.map((tramo) => tramo.hora))].sort((a, b) => a - b);
  if (horas.length === 0) return null;

  const celdas = new Map(turnos.tramos.map((tramo) => [`${tramo.dia}-${tramo.hora}`, tramo]));
  const columnas = {
    gridTemplateColumns: `80px repeat(${horas.length}, minmax(0, 1fr))`,
  };

  return (
    <>
      <p className="mb-2 text-center text-[11px] font-medium text-chart-muted lg:mb-1">
        Hora operativa
      </p>
      <TooltipProvider delayDuration={0}>
        <div className="overflow-x-auto">
          <div style={{ minWidth: Math.max(640, 80 + horas.length * 36) }}>
            <div
              className="mb-1.5 grid gap-1.5 text-center text-[10px] font-semibold text-chart-muted lg:mb-1"
              style={columnas}
            >
              <span className="sticky left-0 z-10 bg-surface/95 text-left text-[10px] font-semibold uppercase tracking-wide text-chart-muted shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur">
                Día / Hora
              </span>
              {horas.map((hora) => (
                <span key={hora}>{hora}:00</span>
              ))}
            </div>
            {DIAS.map((dia, indice) => (
              <div
                key={dia}
                className="mb-1.5 grid items-center gap-1.5 lg:mb-0.5"
                style={columnas}
              >
                <span
                  className={`sticky left-0 z-10 flex items-center self-stretch bg-surface/95 text-[11px] font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur ${FINDE.includes(indice) ? "text-[var(--critical)]" : "text-chart-text"}`}
                >
                  {dia}
                </span>
                {horas.map((hora) => {
                  const tramo = celdas.get(`${indice}-${hora}`);
                  const recomendacion = tramo?.recomendacion ?? "NO_DATA";
                  return (
                    <Tooltip key={hora}>
                      <TooltipTrigger asChild>
                        <div
                          className="h-8 rounded-[5px] transition-transform hover:scale-110 hover:ring-2 hover:ring-foreground/30 lg:h-[clamp(12px,1.55dvh,16px)]"
                          style={{ backgroundColor: COLORES[recomendacion] }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">
                          {dia} - {hora}:00
                        </p>
                        <p>Estado: {etiquetaTurno(recomendacion)}</p>
                        {tramo && (
                          <p>Presión de sala: {Math.round(tramo.presion_operativa * 100)}%</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-chart-muted lg:mt-1.5 lg:gap-3">
        {LEYENDA.map((codigo) => (
          <span key={codigo} className="flex items-center gap-1.5">
            <span className="size-3 rounded-[4px]" style={{ backgroundColor: COLORES[codigo] }} />
            {ETIQUETAS_TURNO[codigo]}
          </span>
        ))}
      </div>
    </>
  );
}
