import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo, ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    idx: "01",
    title: "Ingeniería de Menús",
    text: "Identifica platos estrella y decide con datos qué recetas sostienen el margen y cuáles lo erosionan.",
  },
  {
    idx: "02",
    title: "Gestión de personal",
    text: "Cruza afluencia y turnos. Evita sobrecoste en horas valle y colapsos cuando la sala se llena.",
  },
  {
    idx: "03",
    title: "Director Financiero Virtual",
    text: "Chatea con tus datos, resuelve dudas al instante y obtén un panel nativo listo para exportar a PDF.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-6 pt-4">
        <header className="flex items-center justify-between">
          <Logo
            className="text-[1.55rem] leading-none"
            markClassName="size-10 rounded-[10px] text-base"
          />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-[10px] px-3 text-sm font-semibold text-foreground hover:bg-surface"
            >
              Entrar
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--brand)_28%,transparent)] bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] px-3.5 py-1 text-[0.78rem] font-bold tracking-tight text-brand">
            <span className="size-1.5 rounded-full bg-brand" />
            Análisis de datos para hostelería
          </span>
          <h1 className="mx-auto mt-4 max-w-[820px] text-[clamp(1.9rem,4.4vw,2.85rem)] font-extrabold leading-[1.1] tracking-[-0.035em]">
            Decisiones estratégicas para
            <br />
            <span className="gradient-text">restaurantes, cafeterías y bares</span>
          </h1>
          <p className="mx-auto mt-3.5 max-w-[580px] text-[1.02rem] leading-relaxed text-muted-foreground">
            Convierte la exportación de tu TPV en un panel financiero. Detecta fugas de margen,
            ajusta turnos y consulta tus números en lenguaje natural.
          </p>
          <Button
            asChild
            className="mt-6 min-w-[200px] rounded-[10px] bg-cta font-semibold text-on-accent shadow-[0_10px_24px_-14px_var(--cta)] hover:bg-cta-hover"
          >
            <Link to="/login">Entrar</Link>
          </Button>
        </section>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-surface p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_-22px_rgba(15,23,42,0.28)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--brand),var(--brand-2))] opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none" />
              <span className="text-[0.72rem] font-bold tabular-nums tracking-[0.15em] text-brand/70">
                {f.idx}
              </span>
              <h3 className="mt-1.5 text-sm font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[0.83rem] leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>

        <footer className="mt-auto flex items-center justify-center gap-2 border-t border-border py-4 text-[0.78rem] text-muted-foreground">
          <span className="font-bold tracking-tight text-foreground">Mesa Cero</span>
          <span className="text-muted-foreground/60">·</span>
          Inteligencia de negocio para restaurantes, cafeterías y bares
        </footer>
      </div>
    </div>
  );
}
