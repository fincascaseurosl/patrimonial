"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.set(el, { yPercent: -100 });
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.killTweensOf(el);
    gsap.fromTo(
      el,
      { yPercent: 0 },
      {
        yPercent: -100,
        duration: reduced ? 0.01 : 0.65,
        ease: "expo.inOut",
        delay: 0.04,
        onComplete: () => {
          gsap.set(el, { yPercent: -100 });
        },
      }
    );

    const safety = window.setTimeout(() => {
      gsap.set(el, { yPercent: -100 });
    }, 1500);

    return () => window.clearTimeout(safety);
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-[var(--ink)] z-[150] pointer-events-none"
      style={{ willChange: "transform", transform: "translateY(-100%)" }}
      aria-hidden="true"
    />
  );
}
