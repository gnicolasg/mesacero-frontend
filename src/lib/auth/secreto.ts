import { readFileSync } from "node:fs";

/**
 * Secreto de Docker en /run/secrets/<nombre> o, en local, la variable de entorno.
 * Solo lo importan handlers de servidor.
 */
export function obtenerSecreto(nombre: string): string {
  try {
    return readFileSync(`/run/secrets/${nombre.toLowerCase()}`, "utf8").trim();
  } catch {
    const valor = process.env[nombre];
    return typeof valor === "string" ? valor.trim() : "";
  }
}
