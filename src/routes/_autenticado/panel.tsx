import { createFileRoute } from "@tanstack/react-router";
import { useSesion } from "@/lib/horeca/use-sesion";
import { Ingesta } from "@/workspace/Ingesta";
import { Workspace } from "@/workspace/Workspace";

export const Route = createFileRoute("/_autenticado/panel")({
  head: () => ({
    meta: [{ title: "Panel — Mesa Cero" }],
  }),
  component: Panel,
});

function Panel() {
  const sesion = useSesion();
  const enIngesta = sesion.fase === "vacio" || sesion.fase === "subiendo";

  return enIngesta ? (
    <Ingesta
      ocupado={sesion.ocupado}
      error={sesion.error}
      mensaje={sesion.mensaje}
      onArchivos={(archivos) => void sesion.cargar(archivos)}
      onDemo={() => void sesion.cargarEjemplo()}
    />
  ) : (
    <Workspace sesion={sesion} />
  );
}
