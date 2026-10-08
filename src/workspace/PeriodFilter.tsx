import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fechaNum } from "@/lib/format";

export function PeriodFilter({
  rango,
  min,
  max,
  ocupado,
  onConfirmar,
}: {
  rango: DateRange | undefined;
  min: Date;
  max: Date;
  ocupado: boolean;
  onConfirmar: (desde: Date, hasta: Date) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState<DateRange | undefined>(rango);
  const visible = borrador ?? rango;

  useEffect(() => {
    if (!ocupado) setBorrador(rango);
  }, [ocupado, rango]);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-xs font-semibold">Periodo de análisis</span>
      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={ocupado}
            className="btn-secondary rounded-lg bg-field font-normal max-lg:min-h-11 tabular-nums"
          >
            <CalendarDays className="size-4 text-brand" />
            {fechaNum(visible?.from ?? min)} - {fechaNum(visible?.to ?? visible?.from ?? max)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={borrador}
            onSelect={(siguiente) => {
              setBorrador(siguiente);
              if (!siguiente?.from || !siguiente.to) return;
              const desde = siguiente.from <= siguiente.to ? siguiente.from : siguiente.to;
              const hasta = siguiente.from <= siguiente.to ? siguiente.to : siguiente.from;
              onConfirmar(desde, hasta);
              setAbierto(false);
            }}
            defaultMonth={visible?.from ?? min}
            startMonth={min}
            endMonth={max}
            disabled={{ before: min, after: max }}
          />
        </PopoverContent>
      </Popover>
      <span className="text-xs text-muted-foreground">
        Al cerrar el rango se recalculan KPIs, gráficos y chat.
      </span>
    </div>
  );
}
