"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Magnetic } from "@/components/animations";
import { CASA_HERO_SCRUB_VIEWPORTS } from "@/lib/casa-hero-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const VIDEO_SRC = "/videos/construye-tu-casa-hero.mp4";
const POSTER_SRC = "/images/hero/construye-tu-casa-poster.jpg";

// Cuánto del scroll pineado (en alturas de viewport) se dedica a recorrer el
// vídeo. Un recorrido largo = un scrub deliberado y pausado, no un vídeo que
// "pasa volando" en dos gestos de rueda de ratón. Fuente única compartida con
// el Header (que mantiene la barra transparente durante todo este recorrido).
const SCRUB_VIEWPORTS = CASA_HERO_SCRUB_VIEWPORTS;
// Fracción inicial del recorrido en la que se resuelve el desenfoque/contraste
// de entrada (el resto del scroll ya circula nítido).
const FOCUS_REVEAL_FRACTION = 0.18;

/**
 * Hero cinematográfico de "Construye tu casa": un vídeo 4K→1080p de una villa
 * mediterránea materializándose, con la cámara fija y el avance atado 1:1 al
 * scroll (adelante = avanza, atrás = retrocede, parar = se detiene). El texto
 * de entrada se anima una sola vez al montar; el vídeo nunca hace autoplay ni
 * loop — su único "reproductor" es la posición de scroll del usuario.
 */
export function ConstruyeCasaHero() {
  const t = useTranslations("casa");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const focusVeilRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  // No condiciona el JSX (evita mismatches de hidratación) — solo si el
  // efecto de GSAP más abajo activa o no el pin + scroll-scrub del vídeo.
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useGSAP(
    () => {
      // Entrada del texto — se reproduce una sola vez, independiente del scroll.
      const introTl = gsap.timeline({ defaults: { ease: "power4.out" } });
      introTl
        .fromTo(".casahero-eyebrow", { opacity: 0 }, { opacity: 1, duration: 0.9 })
        .fromTo(
          ".casahero-title",
          { opacity: 0, y: 44 },
          { opacity: 1, y: 0, duration: 1.2 },
          "-=0.55",
        )
        .fromTo(
          ".casahero-subtitle",
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 1.0 },
          "-=0.75",
        )
        .fromTo(
          ".casahero-buttons",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.65",
        )
        .fromTo(
          ".casahero-scrollcue",
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          "-=0.4",
        );

      if (reducedMotion) return;

      const video = videoRef.current;
      const section = sectionRef.current;
      if (!video || !section) return;

      // "Primed" en iOS/Safari: sin esto, algunos navegadores móviles no
      // pintan ningún frame hasta que ha habido un play() real, aunque sea
      // instantáneo, antes de tomar el control por currentTime.
      video.play()
        .then(() => video.pause())
        .catch(() => {
          /* autoplay bloqueado — no afecta al scrubbing por currentTime */
        });

      // Guarda de seek: si se piden varios currentTime antes de que el
      // navegador termine de decodificar el anterior, las peticiones se
      // acumulan y el vídeo va "a trompicones" detrás del scroll. Aquí solo
      // hay un seek en vuelo a la vez; si llega uno nuevo mientras tanto,
      // se descarta el intermedio y se guarda solo el más reciente.
      let seeking = false;
      let pendingTime: number | null = null;

      const seekTo = (time: number) => {
        if (seeking) {
          pendingTime = time;
          return;
        }
        seeking = true;
        video.currentTime = time;
      };

      const onSeeked = () => {
        seeking = false;
        if (pendingTime !== null) {
          const next = pendingTime;
          pendingTime = null;
          seekTo(next);
        }
      };
      video.addEventListener("seeked", onSeeked);

      // El pin se crea YA, en el mismo tick que el resto de secciones ancladas
      // de la página (p. ej. el scroll horizontal de "Proceso" más abajo).
      // Antes esperaba a "loadedmetadata" del vídeo para crear el
      // ScrollTrigger — como esa carga es asíncrona, cuando la sección
      // "Proceso" medía dónde debía empezar, el hueco reservado por el pin
      // del hero (su pin-spacer) todavía no existía, así que GSAP calculaba
      // una posición de inicio más corta de la real y las secciones se
      // solapaban. El pin en sí no depende de video.duration (usa alturas de
      // viewport), así que no hay motivo para retrasarlo; solo el cálculo de
      // currentTime necesita esperar a que el vídeo esté listo, y eso se
      // resuelve dentro del propio onUpdate.
      const scrollTriggerInstance = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * SCRUB_VIEWPORTS}`,
        pin: true,
        anticipatePin: 1,
        // Lenis (ver SmoothScroll) ya suaviza la posición de scroll en sí;
        // añadir aquí otro scrub con inercia lo duplicaría y el vídeo se
        // sentiría "a la zaga" del gesto. scrub:true = sigue 1:1 la posición
        // (ya suavizada) de Lenis, sin retraso extra.
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (!video.duration || Number.isNaN(video.duration)) return;
          seekTo(self.progress * video.duration);

          // Velo de apertura: barato de pintar (solo opacidad, sin filtro
          // sobre el vídeo) — un filter:blur() en tiempo real sobre un
          // <video> que además está decodificando frames por el scrub es
          // de lo más costoso que se le puede pedir a un navegador, y era
          // la causa más probable de los tirones. Con esto se consigue una
          // sensación de apertura/enfoque parecida por una fracción del coste.
          if (focusVeilRef.current) {
            const focusProgress = Math.min(self.progress / FOCUS_REVEAL_FRACTION, 1);
            focusVeilRef.current.style.opacity = String(0.55 * (1 - focusProgress));
          }

          if (scrollCueRef.current) {
            scrollCueRef.current.style.opacity = String(1 - Math.min(self.progress / 0.06, 1));
          }
        },
      });

      return () => {
        scrollTriggerInstance.kill();
        video.removeEventListener("seeked", onSeeked);
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[680px] w-full overflow-hidden bg-[var(--ink)]"
    >
      {/*
        Se renderiza siempre el mismo <video>, con el frame inicial como
        poster: para prefers-reduced-motion simplemente no se activa el
        pin + scroll-scrub (ver useGSAP más abajo) y el vídeo queda parado
        mostrando ese primer frame, sin autoplay ni animación.
      */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        preload="auto"
        poster={POSTER_SRC}
        aria-hidden="true"
      >
        {/*
          1440p (CRF15) y no 4K a propósito: medido en la página real (con
          Lenis + GSAP + el resto de secciones activos, no el vídeo aislado),
          el 4K competía por hilo principal con el suavizado del scroll y
          llegaba a quedarse a la mitad del recorrido en el mismo tiempo real
          — el mismo síntoma de "tirones/rebote" ya corregido antes. 1440p
          iguala el rendimiento del 1080p anterior (0 fotogramas perdidos,
          mismos tiempos de scroll) con notablemente más nitidez.
        */}
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Velo de apertura inicial — ver comentario en el onUpdate del scrub */}
      <div
        ref={focusVeilRef}
        className="absolute inset-0 bg-white pointer-events-none"
        style={{ opacity: reducedMotion ? 0 : 0.55 }}
        aria-hidden="true"
      />

      {/* Degradado mínimo, solo para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="casahero-eyebrow text-white/75 text-[11px] md:text-[12px] font-semibold tracking-[0.38em] uppercase mb-7">
          {t("heroEyebrow")}
        </p>
        <h1 className="casahero-title font-display text-white text-[clamp(2.25rem,5.4vw,4.75rem)] font-medium leading-[1.08] tracking-[-0.02em] text-balance max-w-4xl">
          {t("heroTitulo")}
        </h1>
        <p className="casahero-subtitle text-white/80 text-base md:text-lg leading-relaxed max-w-2xl mt-8">
          {t("heroSub")}
        </p>
        <div className="casahero-buttons flex flex-col sm:flex-row gap-4 mt-12">
          <Magnetic strength={0.18}>
            <Link
              href="/contacto"
              className="cursor-grow inline-flex items-center justify-center px-9 py-5 bg-white text-[var(--ink)] text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--brand-red)] hover:text-white"
            >
              {t("heroBotonPrimario")}
            </Link>
          </Magnetic>
          <Magnetic strength={0.15}>
            <Link
              href="/portfolio"
              className="cursor-grow inline-flex items-center justify-center px-9 py-5 border border-white/35 text-white text-[12px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              {t("heroBotonSecundario")}
            </Link>
          </Magnetic>
        </div>
      </div>

      <div ref={scrollCueRef} className="casahero-scrollcue absolute bottom-8 left-0 right-0 z-10 flex justify-center">
        <div className="flex flex-col items-center gap-3 text-white/55 text-[10px] font-medium tracking-[0.32em] uppercase">
          <span>{t("heroScroll")}</span>
          <span className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-transparent" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
