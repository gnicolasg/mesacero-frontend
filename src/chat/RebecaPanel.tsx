import {
  AlertTriangle,
  ArrowUpRight,
  RotateCcw,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MensajeChat } from "@/lib/horeca/types";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import rebecaAvatar from "@/assets/rebeca-avatar.png";

const SUGERENCIAS = [
  {
    texto: "¿Cómo puedo aumentar el ticket medio?",
    icono: TrendingUp,
  },
  {
    texto: "¿Dónde debo reforzar los turnos?",
    icono: Users,
  },
  {
    texto: "¿Qué platos debería potenciar?",
    icono: UtensilsCrossed,
  },
];

export function RebecaPanel({
  historial,
  restantes,
  disponible,
  pensando,
  onEnviar,
  onReiniciar,
}: {
  historial: MensajeChat[];
  restantes: number;
  disponible: boolean;
  pensando: boolean;
  onEnviar: (texto: string) => void;
  onReiniciar: () => void;
}) {
  const mensajes = historial.map((mensaje) => ({
    autor: mensaje.role === "assistant" ? ("ia" as const) : ("yo" as const),
    texto: mensaje.content,
  }));
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState("");
  const entradaRef = useRef<HTMLTextAreaElement>(null);
  const burbujaRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAbierto(false);
        burbujaRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const panel = panelRef.current;
    const viewport = window.visualViewport;
    if (!panel || !viewport) return;

    const ajustarAlTeclado = () => {
      const espacioTeclado = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      const tecladoAbierto = espacioTeclado > 100 || viewport.height < window.innerHeight - 100;
      panel.dataset["keyboardOpen"] = tecladoAbierto ? "true" : "false";
      panel.style.setProperty("--chat-keyboard-offset", `${tecladoAbierto ? espacioTeclado : 0}px`);
      panel.style.setProperty("--chat-visible-height", `${viewport.height}px`);
    };

    ajustarAlTeclado();
    viewport.addEventListener("resize", ajustarAlTeclado);
    viewport.addEventListener("scroll", ajustarAlTeclado);
    window.addEventListener("resize", ajustarAlTeclado);
    document.addEventListener("focusin", ajustarAlTeclado);
    document.addEventListener("focusout", ajustarAlTeclado);
    return () => {
      viewport.removeEventListener("resize", ajustarAlTeclado);
      viewport.removeEventListener("scroll", ajustarAlTeclado);
      window.removeEventListener("resize", ajustarAlTeclado);
      document.removeEventListener("focusin", ajustarAlTeclado);
      document.removeEventListener("focusout", ajustarAlTeclado);
    };
  }, [abierto]);

  function enviar(pregunta = valor) {
    const limpio = pregunta.trim();
    if (!limpio || pensando || !disponible || restantes <= 0) return;
    setValor("");
    onEnviar(limpio);
  }

  function reiniciar() {
    if (pensando || !disponible) return;
    setValor("");
    onReiniciar();
  }

  const agotado = disponible && restantes <= 0;
  const ultimo = mensajes[mensajes.length - 1];
  const esperandoTexto =
    pensando && (ultimo == null || ultimo.autor !== "ia" || ultimo.texto.length === 0);
  return (
    <>
      {!abierto && (
        <Button
          ref={burbujaRef}
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir chat con Rebeca"
          aria-controls="panel-rebeca"
          aria-expanded={false}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 size-16 rounded-full border-2 border-brand-hover bg-brand-hover p-1 shadow-lg ring-4 ring-brand/20 transition-transform hover:scale-105 hover:bg-brand focus-visible:ring-4 focus-visible:ring-brand lg:hidden motion-reduce:transition-none"
        >
          <span className="grid size-12 place-items-center rounded-full bg-chat-panel">
            <img
              src={rebecaAvatar}
              alt=""
              className="size-9 object-contain"
              width={36}
              height={36}
            />
          </span>
          <span
            className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-brand-hover bg-chat-online"
            aria-hidden="true"
          />
        </Button>
      )}
      <aside
        ref={panelRef}
        id="panel-rebeca"
        aria-label="Chat con Rebeca"
        role={abierto ? "dialog" : undefined}
        aria-modal={abierto ? false : undefined}
        className={`${abierto ? "flex" : "hidden"} chat-mobile-panel fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 z-50 h-[min(70dvh,620px)] w-[min(390px,calc(100vw-1.5rem))] min-h-0 flex-col overflow-hidden rounded-xl border border-chat-edge bg-chat-panel font-chat-body text-chat-copy shadow-chat-panel lg:static lg:flex lg:h-full lg:w-auto lg:rounded-2xl`}
      >
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-chat-edge bg-chat-surface px-4 py-4 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="grid size-11 place-items-center overflow-hidden rounded-full border border-chat-accent/30 bg-chat-soft shadow-chat-mark"
                aria-hidden="true"
              >
                <img
                  src={rebecaAvatar}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  className="size-8 object-contain"
                />
              </div>
              <span
                className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-chat-panel bg-chat-online shadow-chat-online"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 font-chat-body">
              <h2 className="truncate font-chat-display text-sm font-semibold text-chat-heading">
                Rebeca
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-chat-muted">
                <span className="sr-only">Estado:</span>
                En línea
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{disponible ? restantes : "—"} consultas</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={reiniciar}
                    aria-label="Reiniciar conversación"
                    className="min-h-11 min-w-11 rounded-xl text-chat-muted hover:bg-chat-soft hover:text-chat-heading"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reiniciar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setAbierto(false);
                requestAnimationFrame(() => burbujaRef.current?.focus({ preventScroll: true }));
              }}
              aria-label="Cerrar chat"
              className="min-h-11 min-w-11 text-chat-muted hover:bg-chat-soft hover:text-chat-heading lg:hidden"
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        <Conversation
          className="min-h-0 bg-chat-canvas"
          aria-label="Historial de conversación"
          aria-live="polite"
        >
          <ConversationContent className="gap-5 p-4 sm:p-5">
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-chat-edge" />
              <span className="text-[0.68rem] font-semibold uppercase text-chat-muted">Hoy</span>
              <span className="h-px flex-1 bg-chat-edge" />
            </div>

            {mensajes.map((m, i) => {
              if (m.autor === "ia" && m.texto.length === 0) return null;
              const esBienvenida = i === 0 && m.autor === "ia";
              if (esBienvenida) {
                return (
                  <div
                    key={`${m.autor}-${i}`}
                    className="animate-fade-in overflow-hidden rounded-2xl border border-chat-edge bg-chat-surface shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 border-b border-chat-edge bg-chat-soft/60 px-3.5 py-3">
                      <div className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-chat-accent/30 bg-chat-soft">
                        <img
                          src={rebecaAvatar}
                          alt=""
                          width={32}
                          height={32}
                          loading="lazy"
                          className="size-6 object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-chat-display text-xs font-semibold text-chat-heading">
                          Rebeca
                        </p>
                        <p className="text-[0.66rem] text-chat-muted">Consultora virtual</p>
                      </div>
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-chat-accent/30 bg-chat-soft px-2 py-0.5 text-[0.6rem] font-medium text-chat-accent">
                        <Sparkles className="size-3" />
                        IA
                      </span>
                    </div>
                    <div className="px-3.5 py-3.5">
                      <MessageResponse className="md-body md-tight text-chat-copy [&_*]:text-chat-copy">
                        {m.texto}
                      </MessageResponse>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={`${m.autor}-${i}`}
                  className={m.autor === "ia" ? "flex items-start gap-2.5" : "flex justify-end"}
                >
                  {m.autor === "ia" && (
                    <div
                      className="mt-0.5 grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border border-chat-accent/30 bg-chat-soft"
                      aria-hidden="true"
                    >
                      <img
                        src={rebecaAvatar}
                        alt=""
                        width={24}
                        height={24}
                        loading="lazy"
                        className="size-5 object-contain"
                      />
                    </div>
                  )}
                  <Message
                    from={m.autor === "ia" ? "assistant" : "user"}
                    className="max-w-[88%] animate-fade-in"
                  >
                    <MessageContent
                      className={
                        m.autor === "ia"
                          ? "rounded-xl rounded-tl-sm border border-chat-edge bg-chat-surface px-3.5 py-3 text-chat-copy shadow-xs"
                          : "rounded-xl rounded-tr-sm bg-chat-user px-3.5 py-3 text-chat-user-foreground shadow-sm"
                      }
                    >
                      {m.autor === "ia" ? (
                        <MessageResponse className="md-body md-tight text-chat-copy [&_*]:text-chat-copy">
                          {m.texto}
                        </MessageResponse>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm leading-6">{m.texto}</p>
                      )}
                    </MessageContent>
                  </Message>
                </div>
              );
            })}

            {mensajes.length === 1 && !pensando && (
              <section aria-labelledby="sugerencias-rebeca" className="ml-9 space-y-2.5">
                <h3
                  id="sugerencias-rebeca"
                  className="text-[0.68rem] font-semibold uppercase text-chat-muted"
                >
                  Sugerencias inteligentes
                </h3>
                <div className="grid gap-2">
                  {SUGERENCIAS.map(({ texto, icono: Icono }) => (
                    <Button
                      key={texto}
                      type="button"
                      variant="ghost"
                      onClick={() => enviar(texto)}
                      disabled={agotado || pensando}
                      className="group grid h-auto min-h-11 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-chat-edge bg-chat-action px-3 py-2.5 text-left text-chat-copy shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-chat-accent/45 hover:bg-chat-action-hover hover:text-chat-heading hover:shadow-sm focus-visible:ring-2 focus-visible:ring-chat-accent"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-chat-soft text-chat-accent">
                        <Icono className="size-4" />
                      </span>
                      <span className="min-w-0 whitespace-normal text-xs font-medium leading-4">
                        {texto}
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-chat-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-chat-accent" />
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {esperandoTexto && (
              <div className="flex items-center gap-2.5" role="status">
                <div
                  className="grid size-7 shrink-0 place-items-center rounded-lg border border-chat-accent/30 bg-chat-soft font-chat-display text-[0.65rem] font-bold text-chat-heading"
                  aria-hidden="true"
                >
                  R
                </div>
                <div className="rounded-xl rounded-tl-sm border border-chat-edge bg-chat-surface px-3.5 py-2.5 shadow-xs">
                  <Shimmer className="text-xs text-chat-muted">Rebeca está pensando…</Shimmer>
                </div>
              </div>
            )}

            {agotado && (
              <div
                className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm"
                role="alert"
              >
                <AlertTriangle className="size-4 shrink-0 text-warning" />
                Límite de consultas alcanzado.
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton
            aria-label="Ir al mensaje más reciente"
            className="min-h-11 min-w-11"
          />
        </Conversation>

        <div className="shrink-0 border-t border-chat-edge bg-chat-panel/95 p-3 backdrop-blur-xl lg:p-4">
          <PromptInput
            onSubmit={({ text }) => {
              enviar(text);
            }}
            className="[&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-chat-edge [&_[data-slot=input-group]]:bg-chat-surface [&_[data-slot=input-group]]:shadow-sm [&_[data-slot=input-group]]:focus-within:border-chat-accent [&_[data-slot=input-group]]:focus-within:ring-2 [&_[data-slot=input-group]]:focus-within:ring-chat-accent/25"
          >
            <PromptInputTextarea
              ref={entradaRef}
              aria-label="Mensaje para Rebeca"
              rows={1}
              maxLength={1000}
              value={valor}
              disabled={!disponible || agotado}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Pregunta sobre ventas, menú o equipo..."
              className="min-h-14 max-h-28 px-3.5 pb-1 pt-3.5 text-sm leading-5 text-chat-copy placeholder:text-chat-muted"
            />
            <PromptInputFooter className="justify-between px-3 pb-2 pt-1.5">
              <span className="text-[0.68rem] tabular-nums text-chat-muted" aria-live="polite">
                {valor.length}/1000
              </span>
              <PromptInputSubmit
                aria-label="Enviar"
                disabled={!disponible || !valor.trim() || agotado || pensando}
                className="size-9 rounded-lg bg-chat-user text-chat-user-foreground shadow-sm hover:bg-chat-user-hover"
              >
                <Send className="size-4" />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </aside>
    </>
  );
}
