"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  speed?: number; // seconds for one full loop
  reverse?: boolean;
  className?: string;
  pauseOnHover?: boolean;
};

export function MarqueeText({
  children,
  speed = 40,
  reverse = false,
  className = "",
  pauseOnHover = false,
}: Props) {
  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
    >
      <div
        className={`marquee-track inline-flex ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="inline-flex shrink-0">{children}</div>
        <div className="inline-flex shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
