import type { ClaseMenu, MetricaAfluencia, MetricaTicket, PresionTurno } from "./types";

/** Mismas cadenas que `horeca.presentation.labels.es`. */

export const ETIQUETAS_MENU: Record<ClaseMenu, string> = {
  STAR: "⭐ Estrella",
  PLOWHORSE: "🐴 Caballo de Batalla",
  PUZZLE: "🧩 Rompecabezas",
  DOG: "🐶 Perro",
  UNCLASSIFIED: "Sin Clasificar",
};

export const ETIQUETAS_TURNO: Record<PresionTurno, string> = {
  PEAK: "🔥 Pico (Refuerzo / No descansos)",
  BASE: "✅ Mantenimiento (Turno Base)",
  VALLEY: "💤 Valle (Descansos / Cambio Turno)",
  NO_DATA: "Sin datos",
};

export const ETIQUETAS_TICKET: Record<MetricaTicket, string> = {
  PER_TICKET: "🧾 Ticket Medio",
  PER_LINE_ITEM: "🛒 Precio Medio Artículo",
};

export const ETIQUETAS_AFLUENCIA: Record<MetricaAfluencia, string> = {
  TICKETS: "Tickets",
  LINE_ITEMS: "Líneas de venta",
  REVENUE: "Ingresos",
};

export const DIAS: readonly string[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function resolver(mapa: Record<string, string>, codigo: unknown, defecto: string): string {
  if (typeof codigo !== "string" || codigo.length === 0) return defecto;
  return mapa[codigo] ?? (defecto || codigo);
}

export function etiquetaMenu(codigo: unknown, defecto = ""): string {
  return resolver(ETIQUETAS_MENU, codigo, defecto);
}

export function etiquetaTurno(codigo: unknown, defecto = ""): string {
  return resolver(ETIQUETAS_TURNO, codigo, defecto);
}

export function etiquetaTicket(codigo: unknown, defecto = "🛒 Precio Medio Artículo"): string {
  return resolver(ETIQUETAS_TICKET, codigo, defecto);
}

export function etiquetaAfluencia(codigo: unknown, defecto = "Actividad"): string {
  return resolver(ETIQUETAS_AFLUENCIA, codigo, defecto);
}

export function etiquetaDia(codigo: unknown, defecto = ""): string {
  const indice =
    typeof codigo === "number"
      ? codigo
      : typeof codigo === "string" && codigo.trim() !== ""
        ? Number(codigo)
        : Number.NaN;
  if (Number.isInteger(indice) && indice >= 0 && indice <= 6) {
    return DIAS[indice] ?? defecto;
  }
  if (codigo == null || codigo === "") return defecto;
  return defecto || String(codigo);
}
