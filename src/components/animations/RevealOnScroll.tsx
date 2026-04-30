"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  stagger?: number;
  once?: boolean;
}

export function RevealOnScroll({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 40,
  className = "",
  once = true,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  const getFrom = () => {
    switch (direction) {
      case "up": return { y: distance, opacity: 0 };
      case "down": return { y: -distance, opacity: 0 };
      case "left": return { x: distance, opacity: 0 };
      case "right": return { x: -distance, opacity: 0 };
      case "none": return { opacity: 0 };
    }
  };

  useGSAP(() => {
    if (!ref.current) return;

    const from = getFrom();
    const to: Record<string, unknown> = { opacity: 1, duration, delay, ease: "power3.out", immediateRender: false };
    if ('y' in from) to.y = 0;
    if ('x' in from) to.x = 0;

    gsap.fromTo(ref.current, from, {
      ...to,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
