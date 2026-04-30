"use client";

import { useState } from "react";

type FAQItem = { q: string; a: string };

export function HomeFAQ({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="border-t border-[var(--line)]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className="border-b border-[var(--line)]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-6 py-7 md:py-8 text-left cursor-grow group"
              aria-expanded={isOpen}
            >
              <span className="font-display text-xl md:text-2xl font-medium tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--brand-red)] transition-colors duration-300">
                {item.q}
              </span>
              <span
                className={`shrink-0 mt-2 w-5 h-5 relative transition-transform duration-500 ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                <span className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[var(--ink)] -translate-y-1/2" />
                <span className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-[var(--ink)] -translate-x-1/2" />
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="text-[var(--ink-soft)] text-base md:text-lg leading-relaxed pb-8 max-w-2xl">
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
