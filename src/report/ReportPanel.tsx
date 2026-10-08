import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function InformeTab({
  markdown,
  redactando,
  onGenerar,
  onDescargar,
}: {
  markdown: string | null;
  redactando: boolean;
  onGenerar: () => void;
  onDescargar: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold">Informe ejecutivo estratégico</h3>
        <Button
          onClick={onGenerar}
          disabled={redactando}
          className="rounded-lg bg-cta font-semibold text-on-accent hover:bg-cta-hover"
        >
          {redactando && <Loader2 className="size-4 animate-spin" />}
          Generar informe
        </Button>
      </div>
      {!markdown && !redactando && (
        <p className="mt-3 text-xs text-muted-foreground">
          El informe se redacta con los datos del periodo analizado. La descarga es el PDF de ese
          texto.
        </p>
      )}
      {redactando && <p className="mt-3 text-sm text-muted-foreground">Redactando el informe…</p>}
      {markdown && (
        <Accordion
          type="single"
          collapsible
          defaultValue="informe"
          className="mt-3 animate-in fade-in duration-300"
        >
          <AccordionItem value="informe" className="border-none">
            <AccordionTrigger className="font-semibold hover:no-underline">
              Ver informe
            </AccordionTrigger>
            <AccordionContent>
              <div className="md-body text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              </div>
              <Button
                className="mt-4 rounded-lg bg-cta font-semibold text-on-accent hover:bg-cta-hover"
                onClick={onDescargar}
              >
                <Download className="size-4" /> Descargar informe (PDF)
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
