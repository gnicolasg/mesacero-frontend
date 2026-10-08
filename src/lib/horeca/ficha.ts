import type { FormularioMapeo, RangoFechas } from "./types";

const CLAVE = "mesa-cero-sesion";

const CAMPOS_PREVIOS = [
  "fecha",
  "ventas",
  "producto",
  "categoria",
  "hora",
  "coste",
  "ticket",
  "camarero",
  "canal",
] as const;

export type FichaGuardada = {
  id: string;
  nombreArchivo: string;
  columnas: string[];
  formulario: FormularioMapeo;
  aplicado: FormularioMapeo | null;
  rango: RangoFechas | null;
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return valor != null && typeof valor === "object";
}

function campo(valor: Record<string, unknown>, clave: string): unknown {
  return valor[clave];
}

function esFormulario(valor: unknown): valor is FormularioMapeo {
  if (!esRegistro(valor)) return false;
  return CAMPOS_PREVIOS.every((nombre) => typeof campo(valor, nombre) === "string");
}

function completarFormulario(valor: FormularioMapeo): FormularioMapeo {
  const registro = valor as unknown as Record<string, unknown>;
  const limpio = {} as FormularioMapeo;
  for (const nombre of CAMPOS_PREVIOS) {
    const texto = campo(registro, nombre);
    limpio[nombre] = typeof texto === "string" ? texto : "";
  }
  return limpio;
}

function esRango(valor: unknown): valor is RangoFechas {
  if (!esRegistro(valor)) return false;
  return (
    typeof campo(valor, "fecha_min") === "string" &&
    typeof campo(valor, "fecha_max") === "string" &&
    typeof campo(valor, "filas") === "number"
  );
}

function esFicha(valor: unknown): valor is FichaGuardada {
  if (!esRegistro(valor)) return false;
  const columnas = campo(valor, "columnas");
  const id = campo(valor, "id");
  const aplicado = campo(valor, "aplicado");
  const rango = campo(valor, "rango");
  return (
    typeof id === "string" &&
    id.length > 0 &&
    typeof campo(valor, "nombreArchivo") === "string" &&
    Array.isArray(columnas) &&
    columnas.every((columna) => typeof columna === "string") &&
    esFormulario(campo(valor, "formulario")) &&
    (aplicado == null || esFormulario(aplicado)) &&
    (rango == null || esRango(rango))
  );
}

export function leerFicha(): FichaGuardada | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const bruto = sessionStorage.getItem(CLAVE);
    if (!bruto) return null;
    const datos: unknown = JSON.parse(bruto);
    if (!esFicha(datos)) return null;
    return {
      ...datos,
      formulario: completarFormulario(datos.formulario),
      aplicado: datos.aplicado ? completarFormulario(datos.aplicado) : null,
    };
  } catch {
    return null;
  }
}

export function guardarFicha(ficha: FichaGuardada) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(CLAVE, JSON.stringify(ficha));
}

export function borrarFicha() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(CLAVE);
}
