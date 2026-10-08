import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AffluenceByDay, AffluenceGrid } from "@/charts/AffluenceGrid";
import { CategoryDonut } from "@/charts/CategoryDonut";
import { ChannelBar } from "@/charts/ChannelBar";
import { ChartCard } from "@/charts/ChartCard";
import { HealthGauge } from "@/charts/HealthGauge";
import { estadoSalud } from "@/charts/salud";
import { MenuMatrix } from "@/charts/MenuMatrix";
import { RevenueArea } from "@/charts/RevenueArea";
import { ShiftGrid } from "@/charts/ShiftGrid";
import { TopProductsBar } from "@/charts/TopProductsBar";
import { WaiterMatrix } from "@/charts/WaiterMatrix";
import { ZoneBar } from "@/charts/ZoneBar";
import { fechaDeIso } from "@/lib/format";
import { etiquetaAfluencia } from "@/lib/horeca/labels";
import type { AnalysisResponse } from "@/lib/horeca/types";
import { InformeTab } from "@/report/ReportPanel";

const TABS = [
  ["global", "Visión global"],
  ["menus", "Menús"],
  ["equipo", "Equipo"],
  ["informe", "Informe"],
] as const;

function aviso(texto: string) {
  return <p className="rounded-xl border bg-surface p-6 text-sm text-muted-foreground">{texto}</p>;
}

export function AnalysisTabs({
  analisis,
  isChatOpen,
  informe,
  redactando,
  onGenerarInforme,
  onDescargarInforme,
}: {
  analisis: AnalysisResponse;
  isChatOpen: boolean;
  informe: string | null;
  redactando: boolean;
  onGenerarInforme: () => void;
  onDescargarInforme: () => void;
}) {
  const salud = estadoSalud(analisis.salud.score);
  const serie = analisis.evolucion.puntos.map((punto) => ({
    t: fechaDeIso(punto.fecha).getTime(),
    ventas: punto.ventas,
  }));
  const tituloEvolucion =
    analisis.evolucion.granularidad === "MONTHLY"
      ? "Evolución de ingresos · mensual"
      : "Evolución de ingresos · diaria";
  const hayAfluencia =
    analisis.afluencia.por_horas && analisis.afluencia.celdas.some((celda) => celda.hora != null);
  const hayAfluenciaDiaria = !analisis.afluencia.por_horas && analisis.afluencia.celdas.length > 0;
  const hayTop = analisis.top_productos.length > 0;
  const hayCat = analisis.categorias.length > 0;
  const hayMenu = analisis.menu.length > 0;
  const hayTurnos = analisis.turnos.tramos.length > 0;
  const hayCamareros = analisis.camareros.length > 0;
  const hayCanales = analisis.canales.length > 0;
  const hayZonas = (analisis.zonas ?? []).length > 0;
  const piezasSala = [hayCamareros, hayCanales, hayZonas].filter(Boolean).length;
  const menuCompleto = hayTop && hayCat && hayMenu;
  const altoChat = isChatOpen ? "lg:max-xl:h-[calc(100dvh-365px)]" : "";

  return (
    <Tabs defaultValue="global">
      <TabsList className="grid h-auto w-full grid-cols-4 gap-[0.22rem] rounded-xl border bg-surface p-[0.22rem] max-md:flex max-md:justify-start max-md:overflow-x-auto">
        {TABS.map(([v, l]) => (
          <TabsTrigger
            key={v}
            value={v}
            className="rounded-[9px] py-1.5 text-xs font-semibold data-[state=active]:bg-cta data-[state=active]:text-on-accent data-[state=active]:shadow-none max-md:min-h-11 max-md:shrink-0 max-md:px-4 sm:text-sm"
          >
            {l}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="global" className="mt-1.5 space-y-1 lg:mt-1">
        <div className="grid gap-1 md:grid-cols-[1.3fr_2.2fr]">
          <ChartCard
            title="Salud del negocio"
            className="min-h-[280px] min-[1440px]:min-h-[300px]"
            badge={
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: salud.color,
                  borderColor: `color-mix(in srgb, ${salud.color} 25%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${salud.color} 10%, transparent)`,
                }}
              >
                {salud.badge}
              </span>
            }
          >
            <HealthGauge
              score={analisis.salud.score}
              insight={analisis.salud.insight}
              motivos={analisis.salud.motivos}
            />
          </ChartCard>
          <ChartCard title={tituloEvolucion} className="min-h-[280px] min-[1440px]:min-h-[300px]">
            <RevenueArea serie={serie} />
          </ChartCard>
        </div>
        {hayAfluencia && (
          <ChartCard
            title={`Afluencia por hora · ${etiquetaAfluencia(analisis.afluencia.metrica)}`}
          >
            <AffluenceGrid afluencia={analisis.afluencia} />
          </ChartCard>
        )}
        {hayAfluenciaDiaria && (
          <ChartCard title="Ingresos por día de la semana" className="min-h-[280px]">
            <AffluenceByDay afluencia={analisis.afluencia} />
          </ChartCard>
        )}
      </TabsContent>

      <TabsContent value="menus" className="mt-2 space-y-2">
        {hayTop || hayCat || hayMenu ? (
          menuCompleto ? (
            <div
              className={`grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.28fr)] md:grid-rows-2 lg:h-[calc(100dvh-310px)] lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-2 ${altoChat}`}
            >
              <ChartCard
                title="Top 10 productos (por ingresos)"
                className="h-[360px] md:h-[326px] lg:h-full lg:min-h-0"
              >
                <TopProductsBar productos={analisis.top_productos} />
              </ChartCard>
              <ChartCard
                title="Distribución por categoría"
                className="h-[480px] md:h-[326px] lg:h-full lg:min-h-0"
              >
                <CategoryDonut categorias={analisis.categorias} />
              </ChartCard>
              <ChartCard
                title="Ingeniería de menús"
                className="h-[460px] md:col-start-2 md:row-span-2 md:row-start-1 md:h-[664px] lg:h-full lg:min-h-0"
              >
                <MenuMatrix menu={analisis.menu} />
              </ChartCard>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {hayTop && (
                <ChartCard title="Top 10 productos (por ingresos)" className="h-[360px]">
                  <TopProductsBar productos={analisis.top_productos} />
                </ChartCard>
              )}
              {hayCat && (
                <ChartCard title="Distribución por categoría" className="h-[360px]">
                  <CategoryDonut categorias={analisis.categorias} />
                </ChartCard>
              )}
              {hayMenu && (
                <ChartCard title="Ingeniería de menús" className="h-[460px] md:col-span-2">
                  <MenuMatrix menu={analisis.menu} />
                </ChartCard>
              )}
            </div>
          )
        ) : (
          aviso(
            "Este periodo no trae productos ni categorías. La ingeniería de menús aparece cuando el fichero incluye coste.",
          )
        )}
      </TabsContent>

      <TabsContent value="equipo" className="mt-2">
        {hayTurnos || piezasSala > 0 ? (
          <div
            className={
              hayTurnos
                ? `grid gap-2 lg:h-[calc(100dvh-310px)] lg:grid-rows-[minmax(235px,0.7fr)_minmax(0,1fr)] lg:max-xl:grid-rows-[minmax(228px,0.7fr)_minmax(0,1fr)] ${altoChat}`
                : "grid gap-2"
            }
          >
            {hayTurnos && (
              <ChartCard title="Planificador de turnos y descansos" className="lg:min-h-0">
                <ShiftGrid turnos={analisis.turnos} />
              </ChartCard>
            )}
            {piezasSala > 0 && (
              <div
                className={`grid gap-2 lg:min-h-0 ${
                  piezasSala > 1
                    ? hayCamareros && hayCanales && !hayZonas
                      ? "md:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]"
                      : "md:grid-cols-2"
                    : ""
                }`}
              >
                {hayCamareros && (
                  <ChartCard
                    title="Rendimiento por camarero"
                    className="h-[400px] lg:h-full lg:min-h-0"
                  >
                    <WaiterMatrix camareros={analisis.camareros} />
                  </ChartCard>
                )}
                {hayCanales && (
                  <ChartCard
                    title="Ingresos por canal de venta"
                    className="h-[400px] lg:h-full lg:min-h-0"
                  >
                    <ChannelBar canales={analisis.canales} />
                  </ChartCard>
                )}
                {hayZonas && (
                  <ChartCard title="Ingresos por zona" className="h-[400px] lg:h-full lg:min-h-0">
                    <ZoneBar zonas={analisis.zonas} />
                  </ChartCard>
                )}
              </div>
            )}
          </div>
        ) : (
          aviso("No hay hora, camarero, canal ni zona en el mapeo de este fichero.")
        )}
      </TabsContent>

      <TabsContent value="informe" className="mt-2">
        <InformeTab
          markdown={informe}
          redactando={redactando}
          onGenerar={onGenerarInforme}
          onDescargar={onDescargarInforme}
        />
      </TabsContent>
    </Tabs>
  );
}
