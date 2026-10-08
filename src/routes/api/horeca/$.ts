import { createFileRoute } from "@tanstack/react-router";
import { tokenDe } from "@/lib/auth/cookie";
import { obtenerSecreto } from "@/lib/auth/secreto";

/**
 * Proxy hacia FastAPI. El navegador llama a `/api/horeca/...`.
 * Sin una cookie de acceso válida este proceso no llama a la API
 * y no adjunta la clave. La clave se lee en cada petición, nunca en el módulo.
 *
 * Variables en `frontend/.env.local` (TanStack las carga en el proceso del servidor):
 *   HORECA_API_URL  origen de uvicorn; por defecto http://127.0.0.1:8000
 *   HORECA_API_KEY  el mismo secreto que exige la API, o el fichero /run/secrets/horeca_api_key
 */

const ORIGEN_DEFECTO = "http://127.0.0.1:8000";
const CABECERAS_RESPUESTA = [
  "content-type",
  "content-disposition",
  "cache-control",
  "x-accel-buffering",
];

function entorno(nombre: string): string {
  const valor = process.env[nombre];
  return typeof valor === "string" ? valor.trim() : "";
}

class RutaRechazada extends Error {}

function destinoDe(origen: string, splat: string, requestUrl: string): URL {
  const segmentos = splat.split("/").filter((segmento) => segmento.length > 0);
  if (segmentos.some((segmento) => segmento === "." || segmento === "..")) {
    throw new RutaRechazada();
  }
  const normalizados = segmentos.map((segmento) => segmento.toLowerCase());
  if (normalizados[0] === "auth" && normalizados[1] === "login") {
    throw new RutaRechazada();
  }
  const ruta = segmentos.map((segmento) => encodeURIComponent(segmento)).join("/");
  const destino = new URL(`/api/v1/${ruta}`, origen);
  if (!destino.pathname.startsWith("/api/v1/")) {
    throw new RutaRechazada();
  }
  destino.search = new URL(requestUrl).search;
  return destino;
}

async function reenviar(request: Request, splat: string | undefined): Promise<Response> {
  const token = tokenDe(request);
  if (!token) {
    return Response.json({ detail: "No autorizado." }, { status: 401 });
  }

  const clave = obtenerSecreto("HORECA_API_KEY");
  if (!clave) {
    return Response.json(
      { detail: "Falta HORECA_API_KEY en el servidor del frontend." },
      { status: 503 },
    );
  }

  const origen = entorno("HORECA_API_URL") || ORIGEN_DEFECTO;
  let destino: URL;
  try {
    destino = destinoDe(origen, splat ?? "", request.url);
  } catch (error) {
    if (error instanceof RutaRechazada) {
      return Response.json({ detail: "Ruta no válida." }, { status: 400 });
    }
    return Response.json({ detail: "HORECA_API_URL no es un origen válido." }, { status: 503 });
  }

  const cabeceras = new Headers();
  cabeceras.set("Authorization", `Bearer ${clave}`);
  cabeceras.set("X-Access-Token", token);
  const tipo = request.headers.get("content-type");
  if (tipo) cabeceras.set("content-type", tipo);

  const conCuerpo = request.method !== "GET" && request.method !== "HEAD";
  const cuerpo = conCuerpo ? request.body : null;
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers: cabeceras,
    redirect: "manual",
    signal: request.signal,
  };
  if (cuerpo) {
    init.body = cuerpo;
    init.duplex = "half";
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(destino, init);
  } catch {
    return Response.json({ detail: "No se pudo contactar con la API." }, { status: 503 });
  }

  const salida = new Headers();
  for (const nombre of CABECERAS_RESPUESTA) {
    const valor = respuesta.headers.get(nombre);
    if (valor) salida.set(nombre, valor);
  }

  return new Response(respuesta.body, { status: respuesta.status, headers: salida });
}

export const Route = createFileRoute("/api/horeca/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => reenviar(request, params._splat),
      POST: ({ request, params }) => reenviar(request, params._splat),
      DELETE: ({ request, params }) => reenviar(request, params._splat),
    },
  },
});
