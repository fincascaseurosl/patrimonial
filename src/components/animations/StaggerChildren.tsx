"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "left";
}

export function StaggerChildren({
  children,
  className = "",
  stagger = 0.12,
  duration = 0.7,
  distance = 30,
  direction = "up",
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;
    const items = Array.from(ref.current.children);
    if (!items.length) return;

    gsap.fromTo(items,
      {
        y: direction === "up" ? distance : 0,
        x: direction === "left" ? distance : 0,
        opacity: 0,
      },
      {
        y: 0,
        x: 0,
        opacity: 1,
        duration,
        stagger,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );
  }, { scope: ref });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
