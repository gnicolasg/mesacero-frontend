import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo, ThemeToggle } from "@/components/ThemeToggle";

export function Ingesta({
  ocupado,
  error,
  mensaje,
  onArchivos,
  onDemo,
}: {
  ocupado: boolean;
  error: string | null;
  mensaje: string | null;
  onArchivos: (archivos: File[]) => void;
  onDemo: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [arrastrando, setArrastrando] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-6 pt-4">
        <header className="flex items-center gap-2">
          <Logo
            className="text-[1.55rem] leading-none"
            markClassName="size-10 rounded-[10px] text-base"
          />
          <span className="rounded-full border border-brand/20 bg-brand-soft px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-brand-strong">
            Panel
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "same-origin",
                }).finally(() => {
                  window.location.assign("/login");
                });
              }}
              className="btn-secondary rounded-lg bg-transparent"
            >
              Salir
            </Button>
          </div>
        </header>

        <section className="mt-8 text-center">
          <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.03em]">
            Sube la exportación del TPV
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-muted-foreground">
            CSV o Excel. El análisis se queda en tu sesión.
          </p>
        </section>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            if (ocupado) return;
            const archivos = Array.from(e.dataTransfer.files);
            if (archivos.length > 0) onArchivos(archivos);
          }}
          className={`mt-7 flex min-h-[130px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-brand bg-surface px-6 py-7 text-center shadow-soft transition-all hover:border-brand-hover hover:bg-[color-mix(in_srgb,var(--brand)_8%,var(--surface))] hover:shadow-[0_18px_40px_-20px_color-mix(in_srgb,var(--brand)_55%,transparent)] ${
            arrastrando
              ? "border-brand-hover bg-[color-mix(in_srgb,var(--brand)_8%,var(--surface))]"
              : ""
          }`}
        >
          <p className="text-[1.02rem] font-semibold">Arrastra tu exportación del TPV</p>
          <p className="text-sm text-muted-foreground">
            CSV, Excel · hasta 8 archivos · máx. 50 MB
          </p>
          <input
            ref={input}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const lista = e.target.files;
              if (lista && lista.length > 0) onArchivos(Array.from(lista));
              e.target.value = "";
            }}
          />
          <Button
            onClick={() => input.current?.click()}
            disabled={ocupado}
            className="mt-2 min-w-[200px] rounded-[10px] bg-cta font-semibold text-on-accent shadow-[0_10px_24px_-14px_var(--cta)] hover:bg-cta-hover"
          >
            {ocupado ? (mensaje ?? "Leyendo archivo...") : "Subir Archivo"}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-center text-sm text-[var(--critical)]" role="alert">
            {error}
          </p>
        )}
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.8rem] text-muted-foreground">
          Análisis en el servidor · chat vía Groq · sesión por restaurante
        </p>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />o explora sin tus datos
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-center pb-10">
          <Button
            variant="outline"
            onClick={onDemo}
            disabled={ocupado}
            className="btn-secondary rounded-lg bg-transparent font-semibold"
          >
            Probar con datos de ejemplo
          </Button>
        </div>
      </div>
    </div>
  );
}
