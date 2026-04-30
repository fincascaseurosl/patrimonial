"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!overlayRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Kill any in-progress animation, snap to cover, then reveal upward.
    // This works for both first load and client-side navigation: Next.js App
    // Router has already rendered the new page by the time pathname changes,
    // so we only need the reveal (no exit animation needed).
    gsap.killTweensOf(overlayRef.current);
    gsap.set(overlayRef.current, { yPercent: 0 });
    gsap.to(overlayRef.current, {
      yPercent: -100,
      duration: reduced ? 0.01 : 0.65,
      ease: "expo.inOut",
      delay: 0.04,
    });
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-[var(--ink)] z-[150] pointer-events-none"
      style={{ willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
