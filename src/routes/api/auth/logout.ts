import { createFileRoute } from "@tanstack/react-router";
import { cabeceraCookieBorrada, tokenDe } from "@/lib/auth/cookie";
import { obtenerSecreto } from "@/lib/auth/secreto";

const ORIGEN_DEFECTO = "http://127.0.0.1:8000";

function entorno(nombre: string): string {
  const valor = process.env[nombre];
  return typeof valor === "string" ? valor.trim() : "";
}

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = tokenDe(request);
        const clave = obtenerSecreto("HORECA_API_KEY");
        const origen = entorno("HORECA_API_URL") || ORIGEN_DEFECTO;
        if (token && clave) {
          try {
            await fetch(new URL("/api/v1/auth/logout", origen), {
              method: "POST",
              headers: {
                Authorization: `Bearer ${clave}`,
                "X-Access-Token": token,
              },
            });
          } catch {
            // La cookie se borra igual: sin ella el proxy ya no reenvía la clave.
          }
        }
        return new Response(null, {
          status: 204,
          headers: { "set-cookie": cabeceraCookieBorrada() },
        });
      },
    },
  },
});
