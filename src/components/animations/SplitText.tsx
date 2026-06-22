"use client";

import { useRef, ElementType } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: string;
  as?: ElementType;
  className?: string;
  by?: "word" | "char" | "line";
  delay?: number;
  duration?: number;
  stagger?: number;
  trigger?: boolean;
};

export function SplitText({
  children,
  as: Tag = "span",
  className = "",
  by = "word",
  delay = 0,
  duration = 0.9,
  stagger = 0.06,
  trigger = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  const parts =
    by === "char"
      ? children.split("")
      : children.split(/(\s+)/).filter((p) => p.length > 0);

  useGSAP(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll<HTMLElement>(".split-item-inner");
    if (!items.length) return;

    gsap.fromTo(
      items,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration,
        ease: "power4.out",
        stagger,
        delay,
        immediateRender: false,
        scrollTrigger: trigger
          ? {
              trigger: ref.current,
              start: "top 88%",
              toggleActions: "play none none none",
            }
          : undefined,
      }
    );
  }, { scope: ref });

  return (
    <Tag ref={ref as React.RefObject<HTMLElement>} className={className}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) {
          return <span key={i}>{"\u00A0"}</span>;
        }
        return (
          <span
            key={i}
            className="inline-block align-bottom"
            aria-hidden={i > 0 ? "true" : undefined}
          >
            <span className="split-item-inner inline-block" style={{ willChange: "transform" }}>
              {part}
            </span>
          </span>
        );
      })}
      <span className="sr-only">{children}</span>
    </Tag>
  );
}
