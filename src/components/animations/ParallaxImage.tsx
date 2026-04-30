"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  intensity?: number;
  scale?: number;
}

export function ParallaxImage({
  src,
  alt,
  className = "",
  intensity = 30,
  scale = 1.15,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !imgRef.current) return;

    gsap.set(imgRef.current, { scale });

    gsap.to(imgRef.current, {
      y: -intensity,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover will-change-transform"
      />
    </div>
  );
}
