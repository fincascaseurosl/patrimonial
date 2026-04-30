"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  scale?: number;
};

/** Image with subtle scale-in on scroll, useful inside sticky containers */
export function StickyImage({ src, alt, className = "", scale = 1.15 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (!wrapRef.current || !imgRef.current) return;

    gsap.fromTo(
      imgRef.current,
      { scale, opacity: 0.85 },
      {
        scale: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      }
    );
  }, { scope: wrapRef });

  return (
    <div ref={wrapRef} className={`overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
