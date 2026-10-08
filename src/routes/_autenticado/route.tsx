import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { leerIdentidad } from "@/lib/auth/identidad";

export const Route = createFileRoute("/_autenticado")({
  beforeLoad: async () => {
    const identidad = await leerIdentidad();
    if (!identidad) {
      throw redirect({ to: "/login" });
    }
    return { identidad };
  },
  component: Autenticado,
});

function Autenticado() {
  return <Outlet />;
}
