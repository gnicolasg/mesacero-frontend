/** Cookie de acceso. El navegador no lee el token; FastAPI tampoco ve la cookie. */

const NOMBRE = "horeca_acceso";
const TTL_SEGUNDOS = 60 * 60 * 12;
const TOKEN = /^[A-Za-z0-9_-]{32,128}$/;

function marcaSecure(): string {
  // Cerrado por defecto. NODE_ENV no decide esto: en Docker no viene solo.
  return process.env.HORECA_COOKIE_SECURE === "0" ? "" : "; Secure";
}

export function cabeceraCookie(token: string): string {
  return `${NOMBRE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TTL_SEGUNDOS}${marcaSecure()}`;
}

export function cabeceraCookieBorrada(): string {
  return `${NOMBRE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${marcaSecure()}`;
}

export function tokenDe(request: Request): string | null {
  const cruda = request.headers.get("cookie") ?? "";
  for (const parte of cruda.split(";")) {
    const corte = parte.trim().indexOf("=");
    if (corte <= 0) continue;
    const nombre = parte.trim().slice(0, corte);
    if (nombre !== NOMBRE) continue;
    const token = parte.trim().slice(corte + 1);
    return TOKEN.test(token) ? token : null;
  }
  return null;
}
