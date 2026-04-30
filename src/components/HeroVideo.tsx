"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero video placeholder. Tries to play /videos/hero.mp4. If missing, falls
 * back to a Ken-Burns animated poster image.
 */
export function HeroVideo({ poster }: { poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onError = () => setHasVideo(false);
    v.addEventListener("error", onError);
    return () => v.removeEventListener("error", onError);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="w-full h-full bg-center bg-cover hero-kenburns"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--ink)]/30 via-transparent to-[var(--ink)]/80" />
      <div className="absolute inset-0 bg-[var(--ink)]/30" />
    </div>
  );
}
