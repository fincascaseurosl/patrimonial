"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Disable on touch devices or when reduced motion preferred
    const isTouch = window.matchMedia("(hover: none)").matches;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isTouch || prefersReduced) return;

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const moveDot = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3.out" });
    const moveDotY = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3.out" });
    const moveRing = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      moveDot(e.clientX);
      moveDotY(e.clientY);
      moveRing(e.clientX);
      moveRingY(e.clientY);
    };

    const interactives = "a, button, [role='button'], input, textarea, label, .cursor-grow";
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.(interactives)) {
        gsap.to(ring, { scale: 2.4, opacity: 0.4, duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: 0.4, duration: 0.3, ease: "power3.out" });
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.(interactives)) {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.3, ease: "power3.out" });
      }
    };

    window.addEventListener("mousemove", onMove);
    document.body.addEventListener("mouseover", onOver);
    document.body.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("mouseover", onOver);
      document.body.removeEventListener("mouseout", onOut);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[200] w-9 h-9 rounded-full border border-[var(--ink)]/40 mix-blend-difference hidden md:block"
        style={{ willChange: "transform" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[200] w-1.5 h-1.5 rounded-full bg-[var(--ink)] mix-blend-difference hidden md:block"
        style={{ willChange: "transform" }}
      />
    </>
  );
}

