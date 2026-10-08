import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { tokenDe } from "./cookie";
import { obtenerSecreto } from "./secreto";

/**
 * Resuelve la cookie HttpOnly contra FastAPI. El navegador no ve la clave ni el token.
 */

const ORIGEN_DEFECTO = "http://127.0.0.1:8000";

function entorno(nombre: string): string {
  const valor = process.env[nombre];
  return typeof valor === "string" ? valor.trim() : "";
}

export type Identidad = {
  user_id: string;
  restaurant_id: string;
};

export const leerIdentidad = createServerFn({ method: "GET" }).handler(
  async (): Promise<Identidad | null> => {
    const token = tokenDe(getRequest());
    const clave = obtenerSecreto("HORECA_API_KEY");
    if (!token || !clave) return null;

    const origen = entorno("HORECA_API_URL") || ORIGEN_DEFECTO;
    let respuesta: Response;
    try {
      respuesta = await fetch(new URL("/api/v1/auth/sesion", origen), {
        headers: {
          Authorization: `Bearer ${clave}`,
          "X-Access-Token": token,
        },
      });
    } catch {
      return null;
    }
    if (!respuesta.ok) return null;

    let datos: unknown;
    try {
      datos = await respuesta.json();
    } catch {
      return null;
    }
    const userId = datos && typeof datos === "object" && "user_id" in datos ? datos.user_id : "";
    const restaurantId =
      datos && typeof datos === "object" && "restaurant_id" in datos ? datos.restaurant_id : "";
    if (typeof userId !== "string" || userId.length === 0) return null;
    if (typeof restaurantId !== "string" || restaurantId.length === 0) return null;
    return { user_id: userId, restaurant_id: restaurantId };
  },
);