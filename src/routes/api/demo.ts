import { createFileRoute } from "@tanstack/react-router";

/**
 * Sirve el CSV de ejemplo del repositorio. El navegador lo sube luego por
 * `/api/horeca/.../fuentes`, el mismo camino que un fichero elegido a mano.
 */

const RELATIVAS = [
  "../horeca/data/demo/ventas_tpv_restaurante.csv",
  "horeca/data/demo/ventas_tpv_restaurante.csv",
];

async function leerEjemplo(): Promise<Uint8Array | null> {
  const { readFile } = await import("node:fs/promises");
  const { resolve } = await import("node:path");
  for (const relativa of RELATIVAS) {
    try {
      return await readFile(resolve(process.cwd(), relativa));
    } catch {
      // Prueba la otra raíz: `frontend/` en Vite, la raíz del repo en otros arranques.
    }
  }
  return null;
}

export const Route = createFileRoute("/api/demo")({
  server: {
    handlers: {
      GET: async () => {
        const bytes = await leerEjemplo();
        if (!bytes) {
          return Response.json({ detail: "No se encontró el CSV de ejemplo." }, { status: 404 });
        }
        const buffer = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer;
        return new Response(buffer, {
          headers: { "content-type": "text/csv; charset=utf-8" },
        });
      },
    },
  },
});
