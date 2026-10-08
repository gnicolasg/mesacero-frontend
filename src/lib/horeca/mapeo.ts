import type { FormularioMapeo } from "./types";

/** El API convierte a null cualquier valor que empiece por `--`. */

export const CENTINELA_ELEGIR = "-- Elige una columna --";
export const CENTINELA_HORA = "-- Incluida --";
export const CENTINELA_COSTE = "-- No tengo Costes --";
export const CENTINELA_TICKET = "-- No tengo IDs de Ticket --";
export const CENTINELA_CAMARERO = "-- No tengo Camareros --";
export const CENTINELA_CANAL = "-- No tengo Canales --";

export const MAX_ARCHIVOS = 8;
export const MAX_BYTES = 50 * 1024 * 1024;

const CAMPOS: (keyof FormularioMapeo)[] = [
  "fecha",
  "ventas",
  "producto",
  "categoria",
  "hora",
  "coste",
  "ticket",
  "camarero",
  "canal",
];

export function conCentinelas(formulario: FormularioMapeo): FormularioMapeo {
  return {
    fecha: formulario.fecha || CENTINELA_ELEGIR,
    ventas: formulario.ventas || CENTINELA_ELEGIR,
    producto: formulario.producto || CENTINELA_ELEGIR,
    categoria: formulario.categoria || CENTINELA_ELEGIR,
    hora: formulario.hora || CENTINELA_HORA,
    coste: formulario.coste || CENTINELA_COSTE,
    ticket: formulario.ticket || CENTINELA_TICKET,
    camarero: formulario.camarero || CENTINELA_CAMARERO,
    canal: formulario.canal || CENTINELA_CANAL,
  };
}

export function obligatoriosListos(formulario: FormularioMapeo): boolean {
  return [formulario.fecha, formulario.ventas, formulario.producto, formulario.categoria].every(
    (valor) => valor.length > 0 && !valor.startsWith("--"),
  );
}

export function mismoMapeo(a: FormularioMapeo, b: FormularioMapeo): boolean {
  return CAMPOS.every((campo) => a[campo] === b[campo]);
}

export function validarArchivos(archivos: File[]): string | null {
  if (archivos.length === 0) return "No se recibió ningún archivo.";
  if (archivos.length > MAX_ARCHIVOS) return "Demasiados archivos en una sola subida.";
  const grande = archivos.find((archivo) => archivo.size > MAX_BYTES);
  if (grande) return `«${grande.name}» supera los 50 MB.`;
  return null;
}
