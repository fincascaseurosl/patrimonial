"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "./LogoutButton";

const TABS = [
  { href: "/admin/projects", label: "Proyectos", match: "/admin/projects" },
  { href: "/admin/blog", label: "Blog", match: "/admin/blog" },
  { href: "/admin/blog/queue", label: "Cola IA", match: "/admin/blog/queue" },
  { href: "/admin/blog/sources", label: "Fuentes RSS", match: "/admin/blog/sources" },
  { href: "/admin/categories", label: "Categorías", match: "/admin/categories" },
  { href: "/admin/requests", label: "Solicitudes", match: "/admin/requests" },
];

export function AdminNav() {
  const pathname = usePathname();
  const [newCount, setNewCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/requests");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setNewCount(data.filter((r: { status: string }) => r.status === "new").length);
        }
      } catch {
        // silent
      }
    }
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [pathname]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/admin/projects" className="font-semibold text-gray-900 text-sm">
          Admin · Patrimonial Obras
        </Link>
        <LogoutButton />
      </div>
      <nav className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          // El tab Blog solo se ilumina en /admin/blog y /admin/blog/<slug>/edit y /admin/blog/new,
          // no en las subrutas queue/sources que tienen su propio tab.
          const isBlogRoot = tab.match === "/admin/blog";
          const active = isBlogRoot
            ? pathname === "/admin/blog" ||
              pathname.startsWith("/admin/blog/new") ||
              /^\/admin\/blog\/[^/]+\/edit/.test(pathname)
            : pathname.startsWith(tab.match);
          const showBadge = tab.match === "/admin/requests" && newCount !== null && newCount > 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                active
                  ? "text-red-600 border-red-600"
                  : "text-gray-500 border-transparent hover:text-gray-900"
              }`}
            >
              {tab.label}
              {showBadge && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                  {newCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
