"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: keyof typeof ICONS; badge?: boolean };
type Group = { label: string; items: Item[] };

const TOP: Item[] = [
  { href: "/admin/dashboard", label: "Inicio", icon: "home" },
  { href: "/admin/projects", label: "Proyectos", icon: "grid" },
];

const BLOG: Group = {
  label: "Blog",
  items: [
    { href: "/admin/blog", label: "Posts", icon: "doc" },
    { href: "/admin/blog/queue", label: "Cola IA", icon: "bolt" },
    { href: "/admin/blog/sources", label: "Fuentes RSS", icon: "rss" },
    { href: "/admin/categories", label: "Categorías", icon: "tag" },
  ],
};

const BOTTOM: Item[] = [
  { href: "/admin/requests", label: "Solicitudes", icon: "mail", badge: true },
];

const ICONS = {
  home: "M3 11.5 12 4l9 7.5M5.5 9.7V20h13V9.7",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  doc: "M7 3h7l4 4v14H7zM14 3v5h5",
  bolt: "M13 3 5 13h6l-1 8 9-11h-6z",
  rss: "M5 18.5a1 1 0 100 .01M5 11a8 8 0 018 8M5 4a15 15 0 0115 15",
  tag: "M3 11V4h7l11 11-7 7L3 11zM7.5 7.5h.01",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      className="w-[18px] h-[18px] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
  if (href === "/admin/blog") {
    return (
      pathname === "/admin/blog" ||
      pathname.startsWith("/admin/blog/new") ||
      /^\/admin\/blog\/[^/]+\/edit/.test(pathname)
    );
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState<number | null>(null);

  // Contador de solicitudes nuevas.
  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/requests");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled)
          setNewCount(
            data.filter((r: { status: string }) => r.status === "new").length,
          );
      } catch {
        // silencioso
      }
    }
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  function renderItem(item: Item, indent = false) {
    const active = isActive(pathname, item.href);
    const showBadge = item.badge && newCount !== null && newCount > 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
          indent ? "ml-1" : ""
        } ${
          active
            ? "bg-[var(--brand-red)] text-white"
            : "text-white/65 hover:text-white hover:bg-white/[0.06]"
        }`}
      >
        <Icon name={item.icon} />
        <span className="flex-1">{item.label}</span>
        {showBadge && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[var(--brand-red)] text-[11px] font-bold">
            {newCount}
          </span>
        )}
      </Link>
    );
  }

  const content = (
    <div className="flex h-full flex-col">
      {/* Marca */}
      <Link onClick={() => setOpen(false)} href="/admin/dashboard" className="flex items-center gap-2.5 px-5 h-16 shrink-0">
        <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-[var(--brand-red)] text-white font-bold text-sm">
          P
        </span>
        <span className="leading-tight">
          <span className="block text-white font-semibold text-sm tracking-tight">
            Patrimonial
          </span>
          <span className="block text-white/40 text-[10px] font-medium tracking-[0.18em] uppercase">
            Panel admin
          </span>
        </span>
      </Link>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {TOP.map((i) => renderItem(i))}

        <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/30">
          {BLOG.label}
        </p>
        {BLOG.items.map((i) => renderItem(i, true))}

        <div className="pt-5" />
        {BOTTOM.map((i) => renderItem(i))}
      </nav>

      {/* Pie */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <Icon name="home" />
          Ver web
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M14 4h5v16h-5" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Barra superior móvil */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[var(--ink)] text-white">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-sm">
          <span className="inline-flex w-6 h-6 items-center justify-center rounded bg-[var(--brand-red)] text-white font-bold text-xs">
            P
          </span>
          Patrimonial · Admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
          aria-expanded={open}
          className="p-2 -mr-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </div>

      {/* Backdrop móvil */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-60 bg-[var(--ink)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}
