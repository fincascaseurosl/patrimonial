"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const TABS = [
  { href: "/admin/projects", label: "Proyectos", match: "/admin/projects" },
  { href: "/admin/blog", label: "Blog", match: "/admin/blog" },
  { href: "/admin/categories", label: "Categorías", match: "/admin/categories" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/admin/projects" className="font-semibold text-gray-900 text-sm">
          Admin · Patrimonial Obras
        </Link>
        <LogoutButton />
      </div>
      <nav className="max-w-6xl mx-auto px-6 flex gap-1">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.match);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                active
                  ? "text-red-600 border-red-600"
                  : "text-gray-500 border-transparent hover:text-gray-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
