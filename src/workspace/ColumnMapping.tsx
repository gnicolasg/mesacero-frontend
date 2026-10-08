import {
  Calendar,
  CheckCircle2,
  Clock,
  Euro,
  Hash,
  Layers,
  Receipt,
  Settings2,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CENTINELA_CAMARERO,
  CENTINELA_CANAL,
  CENTINELA_COSTE,
  CENTINELA_ELEGIR,
  CENTINELA_HORA,
  CENTINELA_TICKET,
} from "@/lib/horeca/mapeo";
import type { FormularioMapeo } from "@/lib/horeca/types";

type CampoDef = {
  id: keyof FormularioMapeo;
  label: string;
  icon: LucideIcon;
  centinela: string;
  req?: boolean;
};

const DEFINICIONES: CampoDef[] = [
  { id: "fecha", label: "Fecha", icon: Calendar, centinela: CENTINELA_ELEGIR, req: true },
  { id: "ventas", label: "Ventas", icon: Euro, centinela: CENTINELA_ELEGIR, req: true },
  { id: "producto", label: "Producto", icon: ShoppingBag, centinela: CENTINELA_ELEGIR, req: true },
  { id: "categoria", label: "Categoría", icon: Layers, centinela: CENTINELA_ELEGIR, req: true },
  { id: "hora", label: "Hora", icon: Clock, centinela: CENTINELA_HORA },
  { id: "coste", label: "Coste", icon: Receipt, centinela: CENTINELA_COSTE },
  { id: "ticket", label: "Ticket (ID)", icon: Hash, centinela: CENTINELA_TICKET },
  { id: "camarero", label: "Camarero", icon: User, centinela: CENTINELA_CAMARERO },
  { id: "canal", label: "Canal de Venta", icon: Store, centinela: CENTINELA_CANAL },
];

const enlazado = (valor: string) =>
  valor.length > 0 && !valor.startsWith("-- No tengo") && valor !== CENTINELA_ELEGIR;

function opcionesDe(campo: CampoDef, columnas: string[], valor: string): string[] {
  const base = campo.req ? columnas : [campo.centinela, ...columnas];
  if (valor && !base.includes(valor)) return [valor, ...base];
  if (campo.req && !valor) return [CENTINELA_ELEGIR, ...columnas];
  return base;
}

function Campo({
  c,
  columnas,
  valor,
  onChange,
  ocupado,
}: {
  c: CampoDef;
  columnas: string[];
  valor: string;
  onChange: (v: string) => void;
  ocupado: boolean;
}) {
  const Icon = c.icon;
  const ok = enlazado(valor);
  return (
    <div className="min-w-0 space-y-1.5 max-md:space-y-2">
      <label
        htmlFor={`col-${c.id}`}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground max-md:gap-2 max-md:text-[10px] max-md:font-bold max-md:tracking-[0.08em]"
      >
        <Icon className="size-3.5 shrink-0 text-brand" aria-hidden />
        <span className="truncate">{c.label}</span>
        {c.req && <span className="text-brand">*</span>}
      </label>
      <Select value={valor} onValueChange={onChange} disabled={ocupado}>
        <SelectTrigger
          id={`col-${c.id}`}
          className={`h-9 w-full rounded-lg bg-field text-sm text-field-foreground transition-colors focus-visible:ring-brand max-md:h-11 max-md:rounded-xl max-md:px-3 ${
            ok ? "" : "border-dashed text-muted-foreground"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={`size-1.5 shrink-0 rounded-full ${ok ? "bg-brand" : "bg-muted-foreground/40"}`}
              aria-hidden
            />
            <span className="truncate font-mono text-[13px]">
              <SelectValue />
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          {opcionesDe(c, columnas, valor).map((o) => (
            <SelectItem key={o} value={o} className="font-mono text-[13px]">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ColumnMapping({
  columnas,
  formulario,
  onChange,
  ocupado,
  abrirAlInicio,
}: {
  columnas: string[];
  formulario: FormularioMapeo;
  onChange: (siguiente: FormularioMapeo) => void;
  ocupado: boolean;
  abrirAlInicio: boolean;
}) {
  const total = DEFINICIONES.filter((campo) => enlazado(formulario[campo.id])).length;
  const set = (id: keyof FormularioMapeo) => (valor: string) =>
    onChange({ ...formulario, [id]: valor });
  const req = DEFINICIONES.filter((campo) => campo.req);
  const opt = DEFINICIONES.filter((campo) => !campo.req);

  return (
    <Accordion
      type="single"
      collapsible
      {...(abrirAlInicio ? { defaultValue: "cols" } : {})}
      className="shrink-0 overflow-hidden rounded-2xl border bg-surface shadow-card max-md:rounded-3xl"
    >
      <AccordionItem value="cols" className="border-none">
        <AccordionTrigger className="min-w-0 gap-3 px-4 py-2 lg:py-1.5 max-lg:min-h-11 max-md:items-start max-md:px-5 max-md:py-4 hover:no-underline">
          <span className="flex min-w-0 flex-1 items-center gap-3 text-left max-md:items-start">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-success-soft text-brand max-md:size-10 max-md:rounded-xl">
              <Settings2 className="size-4 max-md:size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col max-md:gap-0">
              <span className="flex min-w-0 items-center gap-2 max-md:flex-wrap">
                <span className="block truncate text-sm font-semibold max-md:text-[17px] max-md:font-bold max-md:leading-tight">
                  Ajustes de columnas
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-full border bg-success-soft px-2 py-0.5 text-[11px] font-semibold tabular-nums text-brand max-md:order-2 max-md:mt-1 max-md:w-fit max-md:font-bold">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  {total}/{DEFINICIONES.length}
                </span>
              </span>
              <span className="block truncate text-[10px] leading-[1.15rem] font-normal text-muted-foreground sm:text-[11px] sm:leading-4 max-md:mt-3 max-md:whitespace-normal max-md:text-xs max-md:leading-relaxed">
                Enlazadas automáticamente. Cámbialas solo si el cruce no encaja.
              </span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 max-md:px-5 max-md:pb-5">
          <Separator className="mb-4 max-md:mb-5" />
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-4 md:grid-cols-4">
            {req.map((c) => (
              <Campo
                key={c.id}
                c={c}
                columnas={columnas}
                valor={formulario[c.id]}
                onChange={set(c.id)}
                ocupado={ocupado}
              />
            ))}
          </div>
          <div className="my-5 hidden items-center gap-3 max-md:flex">
            <Separator className="flex-1" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              Opcionales
            </span>
            <Separator className="flex-1" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-dashed pt-3 max-md:mt-0 max-md:grid-cols-1 max-md:gap-4 max-md:border-t-0 max-md:pt-0 md:grid-cols-5">
            {opt.map((c) => (
              <Campo
                key={c.id}
                c={c}
                columnas={columnas}
                valor={formulario[c.id]}
                onChange={set(c.id)}
                ocupado={ocupado}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
