import { createFileRoute } from "@tanstack/react-router";
import { cabeceraCookie } from "@/lib/auth/cookie";
import { ipDe, permitirLogin } from "@/lib/auth/limite-login";
import { obtenerSecreto } from "@/lib/auth/secreto";

/**
 * El navegador entrega email y contraseña. Este proceso habla con FastAPI
 * y deja el token en una cookie que JavaScript no puede leer.
 */

const ORIGEN_DEFECTO = "http://127.0.0.1:8000";

function entorno(nombre: string): string {
  const valor = process.env[nombre];
  return typeof valor === "string" ? valor.trim() : "";
}

function origenApi(): string {
  return entorno("HORECA_API_URL") || ORIGEN_DEFECTO;
}

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!permitirLogin(ipDe(request))) {
          return Response.json(
            { detail: "Demasiados intentos. Espera un minuto." },
            { status: 429, headers: { "retry-after": "60" } },
          );
        }

        const clave = obtenerSecreto("HORECA_API_KEY");
        if (!clave) {
          return Response.json(
            { detail: "Falta HORECA_API_KEY en el servidor del frontend." },
            { status: 503 },
          );
        }

        let cuerpo: unknown;
        try {
          cuerpo = await request.json();
        } catch {
          return Response.json({ detail: "Credenciales no válidas." }, { status: 401 });
        }
        const email = cuerpo && typeof cuerpo === "object" && "email" in cuerpo ? cuerpo.email : "";
        const password =
          cuerpo && typeof cuerpo === "object" && "password" in cuerpo ? cuerpo.password : "";
        if (typeof email !== "string" || typeof password !== "string") {
          return Response.json({ detail: "Credenciales no válidas." }, { status: 401 });
        }

        let respuesta: Response;
        try {
          respuesta = await fetch(new URL("/api/v1/auth/login", origenApi()), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${clave}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
        } catch {
          return Response.json({ detail: "No se pudo contactar con la API." }, { status: 503 });
        }

        if (!respuesta.ok) {
          return Response.json({ detail: "Credenciales no válidas." }, { status: 401 });
        }

        const datos: unknown = await respuesta.json();
        const token = datos && typeof datos === "object" && "token" in datos ? datos.token : "";
        const userId =
          datos && typeof datos === "object" && "user_id" in datos ? datos.user_id : "";
        const restaurantId =
          datos && typeof datos === "object" && "restaurant_id" in datos ? datos.restaurant_id : "";
        if (
          typeof token !== "string" ||
          typeof userId !== "string" ||
          typeof restaurantId !== "string"
        ) {
          return Response.json({ detail: "No se pudo contactar con la API." }, { status: 503 });
        }

        return Response.json(
          { user_id: userId, restaurant_id: restaurantId },
          { headers: { "set-cookie": cabeceraCookie(token) } },
        );
      },
    },
  },
});
