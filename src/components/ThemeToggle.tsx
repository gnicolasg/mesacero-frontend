import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Tema = "light" | "dark";
const KEY = "mesa-tema";

function aplicar(t: Tema) {
  const r = document.documentElement;
  r.classList.remove("light", "dark");
  r.classList.add(t);
}

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("light");

  useEffect(() => {
    const guardado = localStorage.getItem(KEY) as Tema | null;
    const inicial =
      guardado ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTema(inicial);
    aplicar(inicial);
  }, []);

  function elegir(t: Tema) {
    setTema(t);
    aplicar(t);
    localStorage.setItem(KEY, t);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="radiogroup"
            aria-label="Tema"
            className="inline-flex rounded-[10px] border bg-surface p-0.5"
          >
            {(
              [
                ["light", "Claro"],
                ["dark", "Oscuro"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                role="radio"
                aria-checked={tema === v}
                onClick={() => elegir(v)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  tema === v ? "bg-cta text-on-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>Cambia entre tema claro y oscuro. Se mantiene durante la sesión.</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Logo({
  className = "",
  markClassName = "",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="Mesa Cero">
      <span
        aria-hidden="true"
        className={`grid size-8 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--brand),var(--brand-2))] text-sm font-extrabold text-on-accent shadow-[0_7px_18px_-8px_var(--brand)] ring-1 ring-[color-mix(in_srgb,var(--brand)_32%,transparent)] ${markClassName}`}
      >
        M
      </span>
      <span className={`font-extrabold tracking-tight text-foreground ${className}`}>
        Mesa <span className="gradient-text">Cero</span>
      </span>
    </span>
  );
}
