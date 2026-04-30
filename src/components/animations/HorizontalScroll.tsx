"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal scroll section: pins the container and translates inner track horizontally
 * as user scrolls vertically. Inner track must be wider than viewport.
 */
export function HorizontalScroll({ children, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!wrapRef.current || !trackRef.current) return;

    const track = trackRef.current;
    const distance = () => track.scrollWidth - window.innerWidth;

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: wrapRef.current,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, { scope: wrapRef });

  return (
    <section ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex h-screen items-center" style={{ willChange: "transform" }}>
        {children}
      </div>
    </section>
  );
}
