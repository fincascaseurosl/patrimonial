"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  duration?: number;
  splitLines?: boolean;
}

export function TextReveal({
  children,
  className = "",
  as: Tag = "h2",
  delay = 0,
  duration = 0.9,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    gsap.fromTo(ref.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration,
        delay,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );
  }, { scope: ref as React.RefObject<HTMLElement> });

  return (
    <Tag ref={ref as React.RefObject<never>} className={className}>
      {children}
    </Tag>
  );
}
