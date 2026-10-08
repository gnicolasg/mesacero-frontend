/**
 * Ventana fija del login. Argon2id reserva unos 19 MiB por intento:
 * sin este tope, el proceso se queda sin RAM antes de rechazar la clave.
 *
 * La IP es la que Cloudflare escribe en `CF-Connecting-IP`: el proxy la
 * sustituye y el cliente no puede anteponer otra. `X-Forwarded-For` y
 * `X-Real-IP` llegan como los manda el cliente si el origen está expuesto,
 * así que no cuentan. Sin la cabecera de Cloudflare, todo el proceso
 * comparte el cubo `directo`.
 *
 * El mapa olvida cada IP cuando su ventana caduca. Si no, basta con llenar
 * el techo para dejar fuera a las IP nuevas hasta reiniciar el proceso.
 */

const VENTANA_MS = 60_000;
const MAX_POR_ORIGEN = 10;
const MAX_GLOBAL = 30;
const MAX_ORIGENES = 1_024;

type Slot = { n: number; desde: number };

const porOrigen = new Map<string, Slot>();
let global: Slot = { n: 0, desde: 0 };

function cupo(slot: Slot | undefined, ahora: number, max: number): Slot | null {
  if (!slot || ahora - slot.desde >= VENTANA_MS) return { n: 1, desde: ahora };
  if (slot.n >= max) return null;
  return { n: slot.n + 1, desde: slot.desde };
}

export function ipDe(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 64);
  return "directo";
}

function purgar(ahora: number): void {
  for (const [ip, slot] of porOrigen) {
    if (ahora - slot.desde >= VENTANA_MS) porOrigen.delete(ip);
  }
}

export function permitirLogin(ip: string, ahora = Date.now()): boolean {
  purgar(ahora);
  const siguienteGlobal = cupo(global, ahora, MAX_GLOBAL);
  if (!siguienteGlobal) return false;
  const siguiente = cupo(porOrigen.get(ip), ahora, MAX_POR_ORIGEN);
  if (!siguiente) return false;
  if (!porOrigen.has(ip) && porOrigen.size >= MAX_ORIGENES) return false;
  global = siguienteGlobal;
  porOrigen.set(ip, siguiente);
  return true;
}
