import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo, ThemeToggle } from "@/components/ThemeToggle";

import { RebecaPanel } from "@/chat/RebecaPanel";
import { etiquetaTicket } from "@/lib/horeca/labels";
import type { useSesion } from "@/lib/horeca/use-sesion";
import { dec, eur, fechaDeIso, int, isoDeFecha, pct } from "@/lib/format";
import { ColumnMapping } from "./ColumnMapping";
import { PeriodFilter } from "./PeriodFilter";
import { KpiStrip, type Kpi } from "./KpiStrip";
import { AnalysisTabs } from "./AnalysisTabs";

type Sesion = ReturnType<typeof useSesion>;

function kpisDe(analisis: NonNullable<Sesion["analisis"]>): Kpi[] {
  const { kpis, evolucion } = analisis;
  const spark = evolucion.puntos.map((punto) => punto.ventas);
  const tarjetas: Kpi[] = [
    { label: "Ventas totales", valor: eur(kpis.total_ventas), spark },
    { label: "Tickets", valor: int(kpis.total_tickets) },
    { label: etiquetaTicket(kpis.ticket_metric), valor: eur(kpis.ticket_medio) },
  ];
  if (kpis.tiene_costes) {
    if (kpis.beneficio_bruto != null) {
      tarjetas.push({ label: "Beneficio bruto", valor: eur(kpis.beneficio_bruto) });
    }
    if (kpis.margen_pct != null) {
      tarjetas.push({ label: "Margen bruto", valor: pct(kpis.margen_pct) });
    }
  } else {
    tarjetas.push({
      label: "Margen bruto",
      valor: "Sin costes",
      nota: "Falta la columna de coste",
    });
  }
  if (kpis.food_cost_pct != null) {
    tarjetas.push({ label: "Food cost", valor: pct(kpis.food_cost_pct) });
  }
  if (kpis.unidades != null) {
    tarjetas.push({
      label: "Unidades",
      valor: Number.isInteger(kpis.unidades) ? int(kpis.unidades) : dec(kpis.unidades),
    });
  }
  if (kpis.precio_medio_realizado != null) {
    tarjetas.push({ label: "Precio medio realizado", valor: eur(kpis.precio_medio_realizado) });
  }
  if (kpis.unidades_por_ticket != null) {
    tarjetas.push({ label: "Unidades por ticket", valor: dec(kpis.unidades_por_ticket, 2) });
  }
  if (kpis.descuento_pct != null) {
    tarjetas.push({ label: "Descuento", valor: pct(kpis.descuento_pct) });
  }
  if (kpis.tasa_anulacion != null) {
    tarjetas.push({ label: "Anulación", valor: pct(kpis.tasa_anulacion) });
  }
  if (kpis.cubiertos != null) {
    tarjetas.push({
      label: "Cubiertos",
      valor: Number.isInteger(kpis.cubiertos) ? int(kpis.cubiertos) : dec(kpis.cubiertos),
    });
  }
  if (kpis.gasto_por_comensal != null) {
    tarjetas.push({ label: "Gasto por comensal", valor: eur(kpis.gasto_por_comensal) });
  }
  return tarjetas;
}

const ESQUELETO: Kpi[] = [
  { label: "Ventas", valor: "" },
  { label: "Tickets", valor: "" },
  { label: "Ticket medio", valor: "" },
  { label: "Beneficio", valor: "" },
  { label: "Margen", valor: "" },
];

export function Workspace({ sesion }: { sesion: Sesion }) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const cargando = sesion.fase === "analizando";
  const kpis = sesion.analisis ? kpisDe(sesion.analisis) : ESQUELETO;
  const minIso = sesion.rango?.fecha_min;
  const maxIso = sesion.rango?.fecha_max;
  const inicioPeriodo = sesion.analisis?.periodo.inicio;
  const finPeriodo = sesion.analisis?.periodo.fin;
  const limites = useMemo(() => {
    if (!minIso || !maxIso) return undefined;
    return { min: fechaDeIso(minIso), max: fechaDeIso(maxIso) };
  }, [minIso, maxIso]);
  const seleccionado = useMemo(() => {
    const inicio = inicioPeriodo ?? minIso;
    const fin = finPeriodo ?? maxIso;
    if (!inicio || !fin) return undefined;
    return { from: fechaDeIso(inicio), to: fechaDeIso(fin) };
  }, [inicioPeriodo, finPeriodo, minIso, maxIso]);

  return (
    <div className="flex min-h-screen max-lg:overflow-x-hidden flex-col gap-2 px-3 pt-2 pb-2 lg:h-dvh lg:min-h-0 lg:flex-row lg:gap-1.5 lg:overflow-hidden lg:px-3 lg:pt-1 lg:pb-1">
      <div
        className={`flex min-h-0 w-full min-w-0 flex-col gap-1 lg:overflow-y-auto lg:pr-1 lg:transition-[flex] lg:duration-300 lg:ease-in-out motion-reduce:transition-none ${isChatOpen ? "lg:flex-[72_1_0%]" : "lg:flex-[1_1_0%]"}`}
      >
        <header className="flex items-center gap-2 py-0.5">
          <Logo className="text-[1.18rem] leading-none" markClassName="size-8" />
          <span className="rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-brand-strong">
            Panel
          </span>
          {sesion.nombreArchivo && (
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {sesion.nombreArchivo}
            </span>
          )}
          {sesion.rango && sesion.rango.filas > 0 && (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {int(sesion.rango.filas)} filas
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "same-origin",
                }).finally(() => {
                  window.location.assign("/login");
                });
              }}
              className="btn-secondary rounded-lg bg-transparent max-lg:min-h-11"
            >
              Salir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sesion.cerrar()}
              className="btn-secondary rounded-lg bg-transparent max-lg:min-h-11"
            >
              Cerrar archivo
            </Button>
          </div>
        </header>

        {sesion.formulario && (
          <ColumnMapping
            columnas={sesion.columnas}
            formulario={sesion.formulario}
            onChange={sesion.actualizarFormulario}
            ocupado={sesion.ocupado}
            abrirAlInicio={sesion.fase === "mapeo"}
          />
        )}
        {limites && seleccionado && (
          <PeriodFilter
            rango={seleccionado}
            min={limites.min}
            max={limites.max}
            ocupado={sesion.ocupado}
            onConfirmar={(desde, hasta) => {
              void sesion.cambiarPeriodo(isoDeFecha(desde), isoDeFecha(hasta));
            }}
          />
        )}

        {cargando || sesion.fase === "mapeo" ? (
          <div className="space-y-2">
            <p className="text-center text-xs font-medium text-brand" aria-live="polite">
              {sesion.mensaje ?? "Revisa el cruce de columnas y aplícalo."}
            </p>
            <KpiStrip kpis={kpis} loading />
            <Skeleton className="h-10 rounded-xl" />
            <div className="grid gap-2 lg:grid-cols-[1.12fr_2.38fr]">
              <div className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border bg-surface p-4">
                <Skeleton className="size-40 rounded-full" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex h-[300px] items-end gap-2 rounded-2xl border bg-surface p-4">
                {[40, 55, 35, 70, 60, 85, 50, 90, 65, 95, 80, 100].map((h, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-t-md rounded-b-none"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in space-y-1.5 duration-500">
            <KpiStrip kpis={kpis} />
            {sesion.analisis && (
              <AnalysisTabs
                analisis={sesion.analisis}
                isChatOpen={isChatOpen}
                informe={sesion.informe}
                redactando={sesion.redactando}
                onGenerarInforme={() => void sesion.generarInforme()}
                onDescargarInforme={() => void sesion.bajarInforme()}
              />
            )}
          </div>
        )}
      </div>

      <div
        className={`relative w-full shrink-0 lg:h-full lg:min-w-0 lg:shrink lg:transition-[flex,visibility] lg:duration-300 lg:ease-in-out motion-reduce:transition-none ${isChatOpen ? "lg:visible lg:flex-[28_1_0%]" : "lg:invisible lg:flex-[0_1_0%]"}`}
      >
        {isChatOpen && (
          <button
            type="button"
            onClick={() => setIsChatOpen(false)}
            aria-label="Ocultar panel"
            title="Ocultar panel"
            className="absolute -left-8 top-1/2 z-50 hidden h-24 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-2xl rounded-r-none bg-cta text-on-accent shadow-[-4px_0_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:w-10 hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:w-8 lg:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
        <div className="h-full w-full lg:overflow-hidden">
          <RebecaPanel
            historial={sesion.chat?.mensajes ?? []}
            restantes={sesion.chat?.cuota.restantes ?? 0}
            disponible={sesion.fase === "listo" && sesion.chat != null}
            pensando={sesion.preguntando}
            onEnviar={(texto) => void sesion.preguntar(texto)}
            onReiniciar={() => void sesion.reiniciarConversacion()}
          />
        </div>
      </div>

      {!isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          aria-label="Mostrar panel"
          title="Mostrar panel"
          className="fixed right-0 top-1/2 z-50 hidden h-24 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-r-2xl rounded-l-none bg-cta text-on-accent shadow-[-4px_0_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:w-10 hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:w-8 lg:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
    </div>
  );
}
