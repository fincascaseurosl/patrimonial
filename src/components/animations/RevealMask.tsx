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
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  delay?: number;
};

export function RevealMask({
  children,
  className = "",
  direction = "up",
  duration = 1,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const inner = ref.current.querySelector<HTMLElement>(".reveal-mask-inner");
    if (!inner) return;

    const fromY = direction === "up" ? "100%" : direction === "down" ? "-100%" : "0%";
    const fromX = direction === "left" ? "100%" : direction === "right" ? "-100%" : "0%";

    gsap.fromTo(
      inner,
      { yPercent: parseFloat(fromY), xPercent: parseFloat(fromX) },
      {
        yPercent: 0,
        xPercent: 0,
        duration,
        ease: "power4.out",
        delay,
        immediateRender: false,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div className="reveal-mask-inner" style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
