import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  analizar,
  aplicarMapeo,
  archivoDeEjemplo,
  abrirSesion,
  crearInforme,
  descargarInforme,
  enviarMensaje,
  ErrorApi,
  formularioDesdeSugerencia,
  leerAnalisis,
  leerChat,
  reiniciarChat,
  subirFuentes,
} from "./client";
import { borrarFicha, guardarFicha, leerFicha, type FichaGuardada } from "./ficha";
import { conCentinelas, mismoMapeo, obligatoriosListos, validarArchivos } from "./mapeo";
import type { AnalysisResponse, EstadoChat, FormularioMapeo, RangoFechas } from "./types";

export type Fase = "vacio" | "subiendo" | "mapeo" | "analizando" | "listo";

const MENSAJE_LECTURA = "Leyendo estructura de datos...";
const MENSAJE_REGLAS = "Aplicando reglas de negocio...";
const MENSAJE_ANALISIS = "Analizando modelo de negocio...";

const MENSAJE_LISTO = "Análisis completado. Entorno listo.";
const MENSAJE_SIN_ANALISIS = "Todavía no hay un análisis";
const ESPERA_MAPEO_MS = 500;

function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo completar la operación.";
}

function redirigirSiNoAutorizado(error: unknown): boolean {
  if (!(error instanceof ErrorApi) || error.status !== 401) return false;
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
  return true;
}

function esAbortado(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function useSesion() {
  const [fase, setFase] = useState<Fase>("vacio");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [columnas, setColumnas] = useState<string[]>([]);
  const [formulario, setFormulario] = useState<FormularioMapeo | null>(null);
  const [rango, setRango] = useState<RangoFechas | null>(null);
  const [analisis, setAnalisis] = useState<AnalysisResponse | null>(null);
  const [chat, setChat] = useState<EstadoChat | null>(null);
  const [informe, setInforme] = useState<string | null>(null);
  const [preguntando, setPreguntando] = useState(false);
  const [redactando, setRedactando] = useState(false);
  const marca = useRef(0);
  const sesionId = useRef<string | null>(null);
  const tieneFicha = useRef(false);
  const nombreRef = useRef("");
  const columnasRef = useRef<string[]>([]);
  const aplicadoRef = useRef<FormularioMapeo | null>(null);
  const chatAbort = useRef<AbortController | null>(null);
  const relojMapeo = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cortarChat() {
    chatAbort.current?.abort();
    chatAbort.current = null;
  }

  function cortarMapeoPendiente() {
    if (relojMapeo.current == null) return;
    clearTimeout(relojMapeo.current);
    relojMapeo.current = null;
  }

  function recordar(ficha: FichaGuardada) {
    nombreRef.current = ficha.nombreArchivo;
    columnasRef.current = ficha.columnas;
    guardarFicha(ficha);
  }

  function cerrar(aviso?: string) {
    cortarChat();
    cortarMapeoPendiente();
    borrarFicha();
    marca.current += 1;
    sesionId.current = null;
    tieneFicha.current = false;
    aplicadoRef.current = null;
    setFase("vacio");
    setMensaje(null);
    setNombreArchivo("");
    setColumnas([]);
    setFormulario(null);
    setRango(null);
    setAnalisis(null);
    setChat(null);
    setInforme(null);
    setPreguntando(false);
    setRedactando(false);
    setError(aviso ?? null);
    if (aviso) toast.error(aviso);
  }

  function fallar(error: unknown, vigente: number) {
    if (marca.current !== vigente) return;
    if (redirigirSiNoAutorizado(error)) return;
    const texto = mensajeDe(error);
    if (error instanceof ErrorApi && error.status === 404) {
      cerrar(texto);
      return;
    }
    setError(texto);
    toast.error(texto);
    setMensaje(null);
    if (!tieneFicha.current) {
      sesionId.current = null;
      setFase("vacio");
      return;
    }
    setFase("mapeo");
  }

  async function analizarRango(id: string, form: FormularioMapeo, vigente: number) {
    setError(null);
    setMensaje(MENSAJE_REGLAS);
    setFase("analizando");
    const fechas = await aplicarMapeo(id, form);
    if (marca.current !== vigente) return;
    setRango(fechas);
    setMensaje(MENSAJE_ANALISIS);
    const respuesta = await analizar(id, fechas.fecha_min, fechas.fecha_max);
    if (marca.current !== vigente) return;
    const conversacion = await leerChat(id);
    if (marca.current !== vigente) return;
    setAnalisis(respuesta);
    setChat(conversacion);
    aplicadoRef.current = form;
    tieneFicha.current = true;
    recordar({
      id,
      nombreArchivo: nombreRef.current,
      columnas: columnasRef.current,
      formulario: form,
      aplicado: form,
      rango: fechas,
    });
    setMensaje(null);
    setFase("listo");
    toast.success(MENSAJE_LISTO);
  }

  async function cargar(archivos: File[]) {
    const rechazo = validarArchivos(archivos);
    if (rechazo) {
      setError(rechazo);
      toast.error(rechazo);
      return;
    }
    cortarChat();
    cortarMapeoPendiente();
    borrarFicha();
    aplicadoRef.current = null;
    const vigente = ++marca.current;
    sesionId.current = null;
    setFase("subiendo");
    setError(null);
    setMensaje(MENSAJE_LECTURA);
    setAnalisis(null);
    setChat(null);
    setInforme(null);
    setRango(null);
    setColumnas([]);
    setFormulario(null);
    tieneFicha.current = false;
    try {
      const id = await abrirSesion();
      if (marca.current !== vigente) return;
      sesionId.current = id;
      const extraccion = await subirFuentes(id, archivos);
      if (marca.current !== vigente) return;
      const sugerido = conCentinelas(
        formularioDesdeSugerencia(extraccion.columnas, extraccion.sugerencia),
      );
      const nombre = archivos.map((archivo) => archivo.name).join(", ");
      nombreRef.current = nombre;
      columnasRef.current = extraccion.columnas;
      setNombreArchivo(nombre);
      setColumnas(extraccion.columnas);
      setFormulario(sugerido);
      tieneFicha.current = true;
      recordar({
        id,
        nombreArchivo: nombre,
        columnas: extraccion.columnas,
        formulario: sugerido,
        aplicado: null,
        rango: null,
      });
      if (!obligatoriosListos(sugerido)) {
        setMensaje(null);
        setFase("mapeo");
        return;
      }
      await analizarRango(id, sugerido, vigente);
    } catch (causa) {
      fallar(causa, vigente);
    }
  }

  async function cargarEjemplo() {
    const vigente = marca.current;
    setFase("subiendo");
    setError(null);
    setMensaje(MENSAJE_LECTURA);
    try {
      const archivo = await archivoDeEjemplo();
      if (marca.current !== vigente) return;
      await cargar([archivo]);
    } catch (causa) {
      if (marca.current !== vigente) return;
      const texto = mensajeDe(causa);
      setFase("vacio");
      setMensaje(null);
      setError(texto);
      toast.error(texto);
    }
  }

  function actualizarFormulario(siguiente: FormularioMapeo) {
    setFormulario(siguiente);
    const id = sesionId.current;
    if (!id) return;
    recordar({
      id,
      nombreArchivo: nombreRef.current,
      columnas: columnasRef.current,
      formulario: siguiente,
      aplicado: aplicadoRef.current,
      rango,
    });
    cortarMapeoPendiente();
    relojMapeo.current = setTimeout(() => {
      relojMapeo.current = null;
      void aplicarFormulario(siguiente);
    }, ESPERA_MAPEO_MS);
  }

  async function aplicarFormulario(form: FormularioMapeo) {
    const id = sesionId.current;
    if (!id || !obligatoriosListos(form)) return;
    if (aplicadoRef.current && mismoMapeo(form, aplicadoRef.current)) return;
    cortarChat();
    const vigente = ++marca.current;
    try {
      setAnalisis(null);
      setChat(null);
      setInforme(null);
      setPreguntando(false);
      setRedactando(false);
      await analizarRango(id, form, vigente);
    } catch (causa) {
      fallar(causa, vigente);
    }
  }

  const ocupado = fase === "subiendo" || fase === "analizando";

  async function cambiarPeriodo(inicio: string, fin: string) {
    const id = sesionId.current;
    if (!id || ocupado) return;
    if (analisis?.periodo.inicio === inicio && analisis.periodo.fin === fin) return;
    cortarChat();
    const vigente = ++marca.current;
    setError(null);
    setInforme(null);
    setPreguntando(false);
    setRedactando(false);
    setMensaje(MENSAJE_ANALISIS);
    setFase("analizando");
    try {
      const respuesta = await analizar(id, inicio, fin);
      if (marca.current !== vigente) return;
      const conversacion = await leerChat(id);
      if (marca.current !== vigente) return;
      setAnalisis(respuesta);
      setChat(conversacion);
      setMensaje(null);
      setFase("listo");
      toast.success(MENSAJE_LISTO);
    } catch (causa) {
      if (marca.current !== vigente) return;
      if (redirigirSiNoAutorizado(causa)) return;
      if (causa instanceof ErrorApi && causa.status === 404) {
        cerrar(mensajeDe(causa));
        return;
      }
      setError(mensajeDe(causa));
      toast.error(mensajeDe(causa));
      setMensaje(null);
      setFase(analisis ? "listo" : tieneFicha.current ? "mapeo" : "vacio");
    }
  }

  function conservar(causa: unknown, vigente: number) {
    if (marca.current !== vigente) return;
    if (redirigirSiNoAutorizado(causa)) return;
    if (causa instanceof ErrorApi && causa.status === 404) {
      cerrar(mensajeDe(causa));
      return;
    }
    const texto = mensajeDe(causa);
    setError(texto);
    toast.error(texto);
  }

  async function preguntar(prompt: string) {
    const id = sesionId.current;
    const limpio = prompt.trim();
    if (!id || !limpio || ocupado || preguntando) return;
    const vigente = marca.current;
    cortarChat();
    const control = new AbortController();
    chatAbort.current = control;
    setPreguntando(true);
    setChat((previo) =>
      previo
        ? {
            ...previo,
            mensajes: [
              ...previo.mensajes,
              { role: "user", content: limpio },
              { role: "assistant", content: "" },
            ],
          }
        : previo,
    );
    try {
      await enviarMensaje(
        id,
        limpio,
        (fragmento) => {
          if (marca.current !== vigente) return;
          setChat((previo) => {
            if (!previo) return previo;
            const mensajes = [...previo.mensajes];
            const ultimo = mensajes[mensajes.length - 1];
            if (!ultimo || ultimo.role !== "assistant") return previo;
            mensajes[mensajes.length - 1] = {
              role: "assistant",
              content: ultimo.content + fragmento,
            };
            return { ...previo, mensajes };
          });
        },
        control.signal,
      );
      if (marca.current !== vigente) return;
      setChat(await leerChat(id));
    } catch (causa) {
      if (esAbortado(causa) || marca.current !== vigente) return;
      conservar(causa, vigente);
      if (marca.current !== vigente) return;
      try {
        setChat(await leerChat(id));
      } catch {
        // El historial en pantalla se queda como estaba.
      }
    } finally {
      if (marca.current === vigente) setPreguntando(false);
    }
  }

  async function reiniciarConversacion() {
    const id = sesionId.current;
    if (!id || preguntando) return;
    const vigente = marca.current;
    try {
      await reiniciarChat(id);
      if (marca.current !== vigente) return;
      setChat(await leerChat(id));
    } catch (causa) {
      conservar(causa, vigente);
    }
  }

  async function generarInforme() {
    const id = sesionId.current;
    if (!id || redactando) return;
    const vigente = marca.current;
    setRedactando(true);
    setError(null);
    try {
      const resultado = await crearInforme(id);
      if (marca.current !== vigente) return;
      setInforme(resultado.markdown);
      toast.success("Informe listo para descargar");
    } catch (causa) {
      conservar(causa, vigente);
    } finally {
      if (marca.current === vigente) setRedactando(false);
    }
  }

  async function bajarInforme() {
    const id = sesionId.current;
    if (!id) return;
    const vigente = marca.current;
    try {
      await descargarInforme(id);
    } catch (causa) {
      conservar(causa, vigente);
    }
  }

  useEffect(() => {
    const ficha = leerFicha();
    if (!ficha) return;
    const vigente = ++marca.current;
    sesionId.current = ficha.id;
    nombreRef.current = ficha.nombreArchivo;
    columnasRef.current = ficha.columnas;
    tieneFicha.current = true;
    setNombreArchivo(ficha.nombreArchivo);
    setColumnas(ficha.columnas);
    setFormulario(ficha.formulario);
    aplicadoRef.current = ficha.aplicado;
    setRango(ficha.rango);
    setFase("subiendo");
    setError(null);
    setMensaje("Recuperando la sesión…");

    void (async () => {
      try {
        const respuesta = await leerAnalisis(ficha.id);
        if (marca.current !== vigente) return;
        const conversacion = await leerChat(ficha.id);
        if (marca.current !== vigente) return;
        setAnalisis(respuesta);
        setChat(conversacion);
        if (!ficha.rango) {
          setRango({
            fecha_min: respuesta.periodo.inicio,
            fecha_max: respuesta.periodo.fin,
            filas: 0,
          });
        }
        setMensaje(null);
        setFase("listo");
      } catch (causa) {
        if (marca.current !== vigente) return;
        if (redirigirSiNoAutorizado(causa)) return;
        if (causa instanceof ErrorApi && causa.status === 404) {
          if (causa.message.startsWith(MENSAJE_SIN_ANALISIS)) {
            setMensaje(null);
            setFase("mapeo");
            return;
          }
          borrarFicha();
          sesionId.current = null;
          tieneFicha.current = false;
          nombreRef.current = "";
          columnasRef.current = [];
          setNombreArchivo("");
          setColumnas([]);
          setFormulario(null);
          aplicadoRef.current = null;
          setRango(null);
          setAnalisis(null);
          setChat(null);
          setMensaje(null);
          setFase("vacio");
          return;
        }
        sesionId.current = null;
        tieneFicha.current = false;
        setMensaje(null);
        setError(mensajeDe(causa));
        setFase("vacio");
      }
    })();

    return () => {
      cortarMapeoPendiente();
      marca.current += 1;
    };
  }, []);

  return {
    fase,
    error,
    mensaje,
    nombreArchivo,
    columnas,
    formulario,
    rango,
    analisis,
    chat,
    informe,
    preguntando,
    redactando,
    ocupado,
    cargar,
    cargarEjemplo,
    actualizarFormulario,
    cambiarPeriodo,
    preguntar,
    reiniciarConversacion,
    generarInforme,
    bajarInforme,
    cerrar: () => cerrar(),
  };
}
