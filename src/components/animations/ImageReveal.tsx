"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
}

export function ImageReveal({
  src,
  alt,
  className = "",
  direction = "left",
  duration = 1,
  delay = 0,
}: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !overlayRef.current || !imgRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    const clipFrom: Record<string, string> = {
      left: "inset(0 100% 0 0)",
      right: "inset(0 0 0 100%)",
      up: "inset(100% 0 0 0)",
      down: "inset(0 0 100% 0)",
    };

    tl.fromTo(
        containerRef.current,
        { clipPath: clipFrom[direction] },
        {
          clipPath: "inset(0 0% 0 0)",
          duration,
          delay,
          ease: "power4.inOut",
        }
      )
      .fromTo(
        imgRef.current,
        { scale: 1.2 },
        {
          scale: 1,
          duration: duration * 1.4,
          ease: "power3.out",
        },
        `-=${duration * 0.5}`
      );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={overlayRef} className="w-full h-full">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="w-full h-full object-cover will-change-transform"
        />
      </div>
    </div>
  );
}
