import type {
  AnalysisResponse,
  EstadoChat,
  Extraccion,
  FormularioMapeo,
  Informe,
  RangoFechas,
} from "./types";
import { ROLES_OPCIONALES } from "./types";

/**
 * Llama a `/api/horeca`, el proxy del mismo origen. La clave no viaja en estas peticiones.
 * Estas funciones son del navegador: una ruta de SSR no tiene base para el `fetch` relativo.
 */

export class ErrorApi extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ErrorApi";
    this.status = status;
  }
}

async function detalle(respuesta: Response): Promise<string> {
  try {
    const datos: unknown = await respuesta.json();
    if (datos && typeof datos === "object" && "detail" in datos) {
      const mensaje = (datos as { detail: unknown }).detail;
      if (typeof mensaje === "string" && mensaje) return mensaje;
      if (Array.isArray(mensaje)) {
        const textos = mensaje
          .map((item) => {
            if (item && typeof item === "object" && "msg" in item) {
              const texto = (item as { msg: unknown }).msg;
              return typeof texto === "string" ? texto : "";
            }
            return "";
          })
          .filter((texto) => texto.length > 0);
        if (textos.length > 0) return textos.join(" ");
      }
    }
  } catch {
    // El cuerpo no era JSON.
  }
  return `La API respondió ${respuesta.status}.`;
}

async function rechazar(respuesta: Response): Promise<never> {
  throw new ErrorApi(respuesta.status, await detalle(respuesta));
}

async function exigir<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) return rechazar(respuesta);
  return (await respuesta.json()) as T;
}

const NOMBRE_EJEMPLO = "ventas_tpv_restaurante.csv";

export async function archivoDeEjemplo(): Promise<File> {
  const respuesta = await fetch("/api/demo");
  if (!respuesta.ok) return rechazar(respuesta);
  const blob = await respuesta.blob();
  return new File([blob], NOMBRE_EJEMPLO, { type: "text/csv" });
}

export async function abrirSesion(): Promise<string> {
  const datos = await exigir<{ session_id: string }>(
    await fetch("/api/horeca/sesiones", { method: "POST" }),
  );
  return datos.session_id;
}

export async function subirFuentes(sessionId: string, archivos: File[]): Promise<Extraccion> {
  const formulario = new FormData();
  for (const archivo of archivos) formulario.append("archivos", archivo);
  return exigir(
    await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/fuentes`, {
      method: "POST",
      body: formulario,
    }),
  );
}

export function cuerpoMapeo(formulario: FormularioMapeo): Record<string, string | null> {
  const cuerpo: Record<string, string | null> = {
    fecha: formulario.fecha,
    ventas: formulario.ventas,
    producto: formulario.producto,
    categoria: formulario.categoria,
  };
  for (const rol of ROLES_OPCIONALES) cuerpo[rol] = formulario[rol] || null;
  return cuerpo;
}

export async function aplicarMapeo(
  sessionId: string,
  formulario: FormularioMapeo,
): Promise<RangoFechas> {
  return exigir(
    await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/mapeo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpoMapeo(formulario)),
    }),
  );
}

export async function analizar(
  sessionId: string,
  inicio: string,
  fin: string,
): Promise<AnalysisResponse> {
  return exigir(
    await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/analisis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inicio, fin }),
    }),
  );
}

export async function leerAnalisis(sessionId: string): Promise<AnalysisResponse> {
  return exigir(await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/analisis`));
}

export async function leerChat(sessionId: string): Promise<EstadoChat> {
  return exigir(await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/chat`));
}

function emitirEvento(bloque: string, alLlegar: (fragmento: string) => void) {
  const texto = bloque
    .split("\n")
    .filter((linea) => linea.startsWith("data:"))
    .map((linea) => linea.slice(5).replace(/^ /, ""))
    .join("\n");
  if (texto) alLlegar(texto);
}

export async function enviarMensaje(
  sessionId: string,
  prompt: string,
  alLlegar: (fragmento: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const respuesta = await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    ...(signal ? { signal } : {}),
  });
  if (!respuesta.ok) return rechazar(respuesta);
  if (!respuesta.body) throw new ErrorApi(respuesta.status, "La API no abrió el stream.");

  const lector = respuesta.body.getReader();
  const decodificador = new TextDecoder();
  let resto = "";
  while (true) {
    const { done, value } = await lector.read();
    if (done) break;
    resto += decodificador.decode(value, { stream: true });
    const bloques = resto.split("\n\n");
    resto = bloques.pop() ?? "";
    for (const bloque of bloques) emitirEvento(bloque, alLlegar);
  }
  resto += decodificador.decode();
  if (resto.trim()) emitirEvento(resto, alLlegar);
}

export async function reiniciarChat(sessionId: string): Promise<void> {
  const respuesta = await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/chat`, {
    method: "DELETE",
  });
  if (!respuesta.ok) return rechazar(respuesta);
}

export async function crearInforme(sessionId: string): Promise<Informe> {
  return exigir(
    await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/informes`, {
      method: "POST",
    }),
  );
}

export async function descargarInforme(sessionId: string): Promise<void> {
  const pdf = await fetch(`/api/horeca/sesiones/${encodeURIComponent(sessionId)}/informes/pdf`);
  if (!pdf.ok) return rechazar(pdf);
  const blob = await pdf.blob();
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "Informe_Estrategico_HORECA.pdf";
  enlace.click();
  URL.revokeObjectURL(url);
}

const ROLES_OBLIGATORIOS = ["fecha", "ventas", "producto", "categoria"] as const;

export function formularioDesdeSugerencia(
  columnas: string[],
  sugerencia: Record<string, number>,
): FormularioMapeo {
  const primera = columnas[0] ?? "";
  const elegir = (rol: string) => {
    const indice = sugerencia[rol];
    if (indice == null || indice < 0 || indice >= columnas.length) return "";
    return columnas[indice] ?? "";
  };
  const obligatorio = (rol: (typeof ROLES_OBLIGATORIOS)[number]) => elegir(rol) || primera;
  return {
    fecha: obligatorio("fecha"),
    ventas: obligatorio("ventas"),
    producto: obligatorio("producto"),
    categoria: obligatorio("categoria"),
    hora: elegir("hora"),
    coste: elegir("coste"),
    ticket: elegir("ticket"),
    camarero: elegir("camarero"),
    canal: elegir("canal"),
  };
}
