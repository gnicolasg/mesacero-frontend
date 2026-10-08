import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { leerIdentidad } from "@/lib/auth/identidad";
import { Logo, ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const identidad = await leerIdentidad();
    if (identidad) {
      throw redirect({ to: "/panel" });
    }
  },
  head: () => ({
    meta: [{ title: "Entrar — Mesa Cero" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setOcupado(true);
    setError(null);
    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!respuesta.ok) {
        let detalle = "Credenciales no válidas.";
        try {
          const datos: unknown = await respuesta.json();
          if (
            datos &&
            typeof datos === "object" &&
            "detail" in datos &&
            typeof datos.detail === "string"
          ) {
            detalle = datos.detail;
          }
        } catch {
          // El cuerpo no era JSON.
        }
        setError(detalle);
        return;
      }
      await navigate({ to: "/panel" });
    } catch {
      setError("No se pudo contactar con el servidor.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-6 pt-4">
        <header className="flex items-center justify-between">
          <Link to="/">
            <Logo
              className="text-[1.55rem] leading-none"
              markClassName="size-10 rounded-[10px] text-base"
            />
          </Link>
          <ThemeToggle />
        </header>
        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center pb-16">
          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em]">Entrar</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cada restaurante ve solo sus datos. La sesión queda en una cookie del navegador.
          </p>
          <form className="mt-6 flex flex-col gap-3" onSubmit={(evento) => void enviar(evento)}>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Email
              <Input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Contraseña
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(evento) => setPassword(evento.target.value)}
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={ocupado} className="mt-2">
              {ocupado ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}
