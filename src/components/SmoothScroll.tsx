"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll() {
  useEffect(() => {
    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Un único motor de reloj (el ticker de GSAP) — antes había DOS bucles
    // llamando a lenis.raf() cada frame: un requestAnimationFrame propio y,
    // encima, este mismo ticker. Cada uno con su propio timestamp, así que
    // Lenis recibía dos actualizaciones de física por frame con relojes
    // ligeramente desincronizados. Eso es lo que se notaba como saltos y
    // "rebotes" en cualquier animación atada al scroll (muy visible en el
    // scroll-scrub del vídeo, pero afectaba a todo el sitio). Además, el
    // cleanup de antes pasaba una función anónima nueva a
    // gsap.ticker.remove(), que por identidad de referencia nunca coincidía
    // con la añadida — el ticker nunca se limpiaba de verdad al desmontar.
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return null;
}
