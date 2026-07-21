"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocale } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function Counter({
  end,
  suffix = "",
  prefix = "",
  duration = 2,
  className = "",
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const locale = useLocale();
  const formatter = new Intl.NumberFormat(locale);

  useGSAP(() => {
    if (!ref.current) return;

    const counter = { value: 0 };

    gsap.to(counter, {
      value: end,
      duration,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${formatter.format(Math.round(counter.value))}${suffix}`;
        }
      },
    });
  }, { scope: ref });

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
