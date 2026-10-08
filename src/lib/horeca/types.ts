/** Contrato JSON de `/api/v1`. Las fechas viajan como `YYYY-MM-DD`. */

export interface Extraccion {
  huella: string;
  columnas: string[];
  sugerencia: Record<string, number>;
}

export interface RangoFechas {
  fecha_min: string;
  fecha_max: string;
  filas: number;
}

export interface MapeoColumnas {
  fecha: string;
  ventas: string;
  producto: string;
  categoria: string;
  hora: string | null;
  coste: string | null;
  ticket: string | null;
  camarero: string | null;
  canal: string | null;
  cantidad: string | null;
  descuento: string | null;
  estado: string | null;
  zona: string | null;
  comensales: string | null;
}

export type MetricaTicket = "PER_TICKET" | "PER_LINE_ITEM";
export type Granularidad = "DAILY" | "MONTHLY";
export type MetricaAfluencia = "TICKETS" | "LINE_ITEMS" | "REVENUE";
export type ClaseMenu = "STAR" | "PLOWHORSE" | "PUZZLE" | "DOG" | "UNCLASSIFIED";
export type PresionTurno = "PEAK" | "BASE" | "VALLEY" | "NO_DATA";

/** Lunes = 0, igual que `Weekday` del dominio. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface KpiSummary {
  total_ventas: number;
  total_tickets: number;
  ticket_metric: MetricaTicket;
  ticket_medio: number;
  tiene_costes: boolean;
  total_costes: number | null;
  beneficio_bruto: number | null;
  margen_pct: number | null;
  food_cost_pct: number | null;
  unidades: number | null;
  unidades_por_ticket: number | null;
  precio_medio_realizado: number | null;
  descuento_pct: number | null;
  tasa_anulacion: number | null;
  cubiertos: number | null;
  gasto_por_comensal: number | null;
}

export interface Salud {
  score: number;
  insight: string;
  motivos: string[];
}

export interface PuntoVentas {
  fecha: string;
  ventas: number;
}

export interface Evolucion {
  granularidad: Granularidad;
  puntos: PuntoVentas[];
}

export interface ProductoIngresos {
  producto: string;
  ventas: number;
}

export interface CategoriaIngresos {
  categoria: string;
  ventas: number;
  mix_pct: number;
}

export interface ZonaIngresos {
  zona: string;
  ventas: number;
  mix_pct: number;
}

export interface CeldaAfluencia {
  dia: DiaSemana;
  hora: number | null;
  valor: number;
}

export interface Afluencia {
  metrica: MetricaAfluencia;
  por_horas: boolean;
  celdas: CeldaAfluencia[];
}

export interface TramoTurno {
  dia: DiaSemana;
  hora: number;
  presion_operativa: number;
  recomendacion: PresionTurno;
}

export interface PlanTurnos {
  tramos: TramoTurno[];
}

export interface Camarero {
  camarero: string;
  ventas_totales: number;
  total_tickets: number;
  ticket_medio: number;
}

export interface Canal {
  canal: string;
  ventas_totales: number;
  coste_total: number | null;
  beneficio: number | null;
  margen_pct: number | null;
}

export interface PlatoMenu {
  producto: string;
  ventas_totales: number;
  coste_total: number;
  unidades_vendidas: number;
  beneficio_bruto: number;
  margen_unitario: number;
  clasificacion: ClaseMenu;
  food_cost_pct: number | null;
  contribucion_pct: number | null;
}

export interface AnalysisResponse {
  periodo: { inicio: string; fin: string };
  mapeo: MapeoColumnas;
  kpis: KpiSummary;
  salud: Salud;
  evolucion: Evolucion;
  afluencia: Afluencia;
  turnos: PlanTurnos;
  top_productos: ProductoIngresos[];
  categorias: CategoriaIngresos[];
  camareros: Camarero[];
  canales: Canal[];
  menu: PlatoMenu[];
  zonas: ZonaIngresos[];
}

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
}

export interface EstadoChat {
  mensajes: MensajeChat[];
  cuota: { usados: number; limite: number; restantes: number };
}

export interface Informe {
  markdown: string;
}

export interface FormularioMapeo {
  fecha: string;
  ventas: string;
  producto: string;
  categoria: string;
  hora: string;
  coste: string;
  ticket: string;
  camarero: string;
  canal: string;
}

export const ROLES_OPCIONALES = ["hora", "coste", "ticket", "camarero", "canal"] as const;
