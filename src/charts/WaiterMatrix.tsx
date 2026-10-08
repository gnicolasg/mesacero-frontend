import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { eur, int } from "@/lib/format";
import type { Camarero } from "@/lib/horeca/types";
import { axis, axisLabel, cyan, tipBox } from "./ChartCard";

function dominio(valores: number[]): [number, number] {
  if (valores.length === 0) return [0, 1];
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  if (minimo === maximo) return [Math.max(0, minimo - 1), maximo + 1];
  const margen = (maximo - minimo) * 0.12;
  return [Math.max(0, minimo - margen), maximo + margen];
}

export function WaiterMatrix({ camareros }: { camareros: Camarero[] }) {
  const data = camareros.map((camarero) => ({
    nombre: camarero.camarero,
    tickets: camarero.total_tickets,
    ticket: camarero.ticket_medio,
    ventas: camarero.ventas_totales,
  }));
  const tickets = data.map((punto) => punto.tickets);
  const medios = data.map((punto) => punto.ticket);
  const [xMin, xMax] = dominio(tickets);
  const [yMin, yMax] = dominio(medios);
  const mediaTickets = tickets.reduce((suma, valor) => suma + valor, 0) / (tickets.length || 1);
  const mediaTicket = medios.reduce((suma, valor) => suma + valor, 0) / (medios.length || 1);
  const tMin = Math.min(...medios);
  const tMax = Math.max(...medios);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={0}>
      <ScatterChart margin={{ left: 8, right: 24, top: 24, bottom: 22 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          dataKey="tickets"
          tick={axis}
          stroke="var(--border)"
          domain={[xMin, xMax]}
          label={{
            value: "Volumen (tickets)",
            position: "insideBottom",
            offset: -10,
            ...axisLabel,
          }}
        />
        <YAxis
          type="number"
          dataKey="ticket"
          tick={axis}
          stroke="var(--border)"
          width={56}
          domain={[yMin, yMax]}
          tickFormatter={(v) => `${v} €`}
          label={{
            value: "Calidad (ticket medio €)",
            angle: -90,
            position: "insideLeft",
            ...axisLabel,
          }}
        />
        <ZAxis type="number" dataKey="ventas" range={[140, 1000]} />
        <ReferenceLine
          x={mediaTickets}
          stroke="var(--chart-muted)"
          strokeDasharray="2 4"
          label={{ value: "Media tickets", position: "top", ...axisLabel }}
        />
        <ReferenceLine
          y={mediaTicket}
          stroke="var(--chart-muted)"
          strokeDasharray="2 4"
          label={{ value: "Media ticket", position: "insideTopRight", ...axisLabel }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            const punto = active ? payload?.[0]?.payload : null;
            if (!punto) return null;
            return (
              <div className={tipBox}>
                <p className="mb-1 font-semibold">{punto.nombre}</p>
                <p>Ventas: {eur(punto.ventas)}</p>
                <p>Tickets: {int(punto.tickets)}</p>
                <p>Ticket medio: {eur(punto.ticket)}</p>
              </div>
            );
          }}
        />
        <Scatter data={data}>
          {data.map((punto) => (
            <Cell key={punto.nombre} fill={cyan(punto.ticket, tMin, tMax)} />
          ))}
          <LabelList
            dataKey="nombre"
            position="top"
            offset={6}
            style={{ fontSize: 10, fontWeight: 600, fill: "var(--chart-text)" }}
          />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
