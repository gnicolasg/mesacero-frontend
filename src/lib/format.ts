// Formatting helpers (es-ES)
export const eur = (n: number, d = 2) =>
  `${n.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: "always" } as unknown as Intl.NumberFormatOptions)} €`;
export const int = (n: number) =>
  n.toLocaleString("es-ES", { useGrouping: "always" } as unknown as Intl.NumberFormatOptions);
export const pct = (n: number) =>
  `${n.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
export const dec = (n: number, d = 1) =>
  n.toLocaleString("es-ES", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
    useGrouping: "always",
  } as unknown as Intl.NumberFormatOptions);

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const fechaCorta = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]}`;
export const fechaLarga = (d: Date) => `${fechaCorta(d)} ${d.getFullYear()}`;
export const fechaNum = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

export function fechaDeIso(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano ?? 1970, (mes ?? 1) - 1, dia ?? 1);
}

export function isoDeFecha(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}
