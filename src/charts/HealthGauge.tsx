import { estadoSalud } from "./salud";

export function HealthGauge({
  score,
  insight,
  motivos,
}: {
  score: number;
  insight: string;
  motivos: string[];
}) {
  const { color } = estadoSalud(score);
  const v = Math.max(0, Math.min(100, score));
  const R = 80;
  const CX = 100;
  const CY = 100;
  const largo = Math.PI * R;
  const ang = Math.PI * (1 - v / 100);
  const knob = { x: CX + R * Math.cos(ang), y: CY - R * Math.sin(ang) };
  const d = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <div className="grid grid-cols-[minmax(150px,1.35fr)_minmax(0,1fr)] items-center gap-4">
        <div
          className="relative mx-auto min-w-0 w-full max-w-[250px]"
          role="img"
          aria-label={`Salud del negocio: ${score} sobre 100`}
        >
          <svg viewBox="0 0 200 112" className="w-full overflow-visible">
            <defs>
              <filter id="knob-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow
                  dx="0"
                  dy="1.5"
                  stdDeviation="2"
                  floodColor="#0f172a"
                  floodOpacity="0.18"
                />
              </filter>
            </defs>
            <path
              d={d}
              fill="none"
              stroke="var(--gauge-track)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={largo}
              strokeDashoffset={largo * (1 - v / 100)}
              className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
            />
            <circle
              cx={knob.x}
              cy={knob.y}
              r="7"
              fill="white"
              stroke={color}
              strokeWidth="3"
              filter="url(#knob-shadow)"
            />
          </svg>
          <div
            className="absolute inset-x-0 bottom-1 flex items-baseline justify-center"
            style={{ color }}
          >
            <span className="text-4xl font-extrabold leading-none tabular-nums tracking-tight">
              {score}
            </span>
            <span className="ml-0.5 text-lg font-bold">%</span>
          </div>
        </div>

        <div className="min-w-0 border-l border-border/70 pl-4">
          <p className="text-sm font-semibold leading-snug text-foreground">{insight}</p>
        </div>
      </div>

      {motivos.length > 0 && (
        <div className="border-t border-border/60 pt-2">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            Motivos
          </p>
          <ul className="space-y-1.5">
            {motivos.map((motivo, indice) => (
              <li
                key={`${indice}-${motivo}`}
                className="flex items-start gap-2 text-xs leading-snug"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-foreground">{motivo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
