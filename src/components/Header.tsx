"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { serviceSlugs, serviceKeyMap } from "@/lib/site-config";
import {
  CASA_HERO_SCRUB_VIEWPORTS,
  CASA_HERO_PATHNAME,
} from "@/lib/casa-hero-config";
import { useLocale } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Logo } from "./Logo";

export function Header() {
  const t = useTranslations("nav");
  const tServices = useTranslations("servicios");
  const tCasa = useTranslations("casa");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const allLocales = ["es", "ca", "en"] as const;
  const localeLabels: Record<(typeof allLocales)[number], string> = {
    es: "Español",
    ca: "Català",
    en: "English",
  };
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navExpandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Umbral a partir del cual la barra pasa a fondo blanco. Por defecto basta un
  // pequeño desplazamiento (20px). Excepción: en "Construye tu casa" el hero es
  // un vídeo fijado (pin) que se recorre con scrub a lo largo de varias alturas
  // de viewport; ahí la barra blanca no debe aparecer hasta haber recorrido TODO
  // el vídeo, para no taparlo con una franja blanca mientras se reproduce.
  useEffect(() => {
    const isCasaHero = pathname === CASA_HERO_PATHNAME;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const getThreshold = () => {
      if (!isCasaHero) return 20;
      // Con reduced motion el hero no se fija: mide una sola pantalla, así que
      // basta con haber recorrido (casi) ese primer viewport.
      if (prefersReducedMotion) return window.innerHeight * 0.85;
      // Con el pin activo, el vídeo consume CASA_HERO_SCRUB_VIEWPORTS alturas de
      // viewport antes de soltarse: ese es el final del vídeo.
      return window.innerHeight * CASA_HERO_SCRUB_VIEWPORTS;
    };

    // ¿Hay una sección oscura (marcada con data-nav-dark) justo bajo la barra?
    // Si es así, la barra NO debe pasar a fondo blanco: se queda transparente
    // "como al inicio" para no taparla con una franja blanca (p. ej. el proceso
    // cinematográfico de "Construye tu casa"). Se mide un punto en el centro
    // vertical de la barra (72px de alto → sonda a 36px).
    const isOverDark = () => {
      const probeY = 36;
      const els = Array.from(document.querySelectorAll("[data-nav-dark]"));
      return els.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= probeY && r.bottom >= probeY;
      });
    };

    const onScroll = () => {
      const past = window.scrollY > getThreshold();
      setScrolled(past && !isOverDark());
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Animate nav items on mount
  useGSAP(() => {
    if (!navRef.current) return;
    const children = Array.from(navRef.current.children);
    gsap.fromTo(
      children,
      { y: -8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.2,
        immediateRender: false,
      }
    );
  }, { scope: navRef });

  // Animate mobile menu
  useGSAP(() => {
    if (!mobileMenuRef.current || !mobileMenuOpen) return;
    gsap.fromTo(
      mobileMenuRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: false }
    );
    const items = Array.from(mobileMenuRef.current.querySelectorAll("a, button, .mobile-services-group"));
    gsap.fromTo(
      items,
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.05,
        ease: "power3.out",
        delay: 0.1,
        immediateRender: false,
      }
    );
  }, { dependencies: [mobileMenuOpen] });

  const navItems = [
    { href: "/" as const, label: t("inicio"), hasDropdown: false },
    { href: "/servicios" as const, label: t("servicios"), hasDropdown: true },
    { href: "/construir-casa-a-medida" as const, label: tCasa("navLabel"), hasDropdown: false, highlight: true },
    { href: "/portfolio" as const, label: t("portfolio"), hasDropdown: false },
    { href: "/blog" as const, label: t("blog"), hasDropdown: false },
    { href: "/sobre-nosotros" as const, label: t("sobreNosotros"), hasDropdown: false },
    { href: "/contacto" as const, label: t("contacto"), hasDropdown: false },
  ];

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 150);
  };

  const handleNavEnter = () => {
    if (navExpandTimeoutRef.current) clearTimeout(navExpandTimeoutRef.current);
    setNavExpanded(true);
  };

  const handleNavLeave = () => {
    navExpandTimeoutRef.current = setTimeout(() => {
      setNavExpanded(false);
      setServicesOpen(false);
      setLangOpen(false);
    }, 200);
  };

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav */}
      <nav
        onMouseEnter={handleNavEnter}
        onMouseLeave={handleNavLeave}
        onFocus={handleNavEnter}
        onBlur={handleNavLeave}
        className={`transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "bg-gradient-to-b from-black/40 to-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
          <Link
            href="/"
            className={`relative flex items-center h-[72px] px-1 transition-all duration-500 cursor-grow`}
            aria-label={`Patrimonial — ${t("inicio")}`}
          >
            <Logo variant={scrolled ? "dark" : "light"} tagline={t("logoTagline")} />
          </Link>

          {/* Desktop nav — recogido por defecto, se despliega al pasar el ratón por la parte superior */}
          <div
            ref={navRef}
            className={`hidden lg:flex items-center gap-1 transition-all duration-300 ease-out ${
              navExpanded
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {navItems.map((item) =>
              item.hasDropdown ? (
                /* Servicios with dropdown */
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={handleServicesEnter}
                  onMouseLeave={handleServicesLeave}
                  onFocus={handleServicesEnter}
                  onBlur={handleServicesLeave}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setServicesOpen(false);
                  }}
                >
                  <Link
                    href={item.href}
                    aria-haspopup="menu"
                    aria-expanded={servicesOpen}
                    aria-controls="servicios-menu"
                    className={`relative flex items-center gap-1 px-4 py-2 text-[13px] font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-300 ${
                      pathname.startsWith("/servicios")
                        ? scrolled
                          ? "text-[var(--color-dark)]"
                          : "text-white"
                        : scrolled
                        ? "text-[var(--color-text-light)] hover:text-[var(--color-dark)]"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                    {pathname.startsWith("/servicios") && (
                      <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--color-primary)]" />
                    )}
                  </Link>

                  {/* Dropdown panel — mega menu, 2 columnas, numeradas como el resto del sitio */}
                  <div
                    id="servicios-menu"
                    role="menu"
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
                      servicesOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                    }`}
                  >
                    <div className="bg-[var(--ink)] shadow-2xl py-8 px-8 w-[560px]">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                        {serviceSlugs.map((slug, i) => {
                          const key = serviceKeyMap[slug];
                          return (
                            <Link
                              key={slug}
                              href={{ pathname: "/servicios/[slug]", params: { slug } }}
                              role="menuitem"
                              className="group flex items-baseline gap-3 py-3 border-b border-white/10"
                            >
                              <span className="font-display text-white/30 text-xs tabular-nums shrink-0 group-hover:text-[var(--brand-red)] transition-colors duration-200">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="font-display text-white/85 text-[15px] font-medium tracking-[-0.01em] group-hover:text-white transition-colors duration-200">
                                {tServices(`items.${key}.nombre`)}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between gap-6">
                        <p className="text-white/40 text-[11px] leading-relaxed max-w-[220px]">
                          {tServices("dropdownTagline")}
                        </p>
                        <Link
                          href="/servicios"
                          className="cursor-grow shrink-0 flex items-center gap-2 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--brand-red-soft)] hover:text-white transition-colors duration-200"
                        >
                          {t("verTodos") || "Ver todos"}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-[13px] font-medium tracking-wide uppercase whitespace-nowrap transition-all duration-300 ${
                    item.highlight
                      ? "text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                      : pathname === item.href
                      ? scrolled
                        ? "text-[var(--color-dark)]"
                        : "text-white"
                      : scrolled
                      ? "text-[var(--color-text-light)] hover:text-[var(--color-dark)]"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--color-primary)]" />
                  )}
                </Link>
              )
            )}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-current/10">
              {/* Language dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current);
                  setLangOpen(true);
                }}
                onMouseLeave={() => {
                  langTimeoutRef.current = setTimeout(() => setLangOpen(false), 150);
                }}
              >
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  className={`flex items-center gap-1 text-[12px] font-medium tracking-wider uppercase transition-colors duration-300 ${
                    scrolled
                      ? "text-[var(--color-text-muted)] hover:text-[var(--color-dark)]"
                      : "text-white/80 hover:text-white"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                >
                  {locale.toUpperCase()}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`absolute top-full right-0 pt-2 transition-all duration-200 ${
                    langOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                  }`}
                  role="menu"
                >
                  <div className="bg-white shadow-lg border border-gray-100 py-2 min-w-[140px]">
                    {allLocales.map((l) => {
                      const active = l === locale;
                      return (
                        <button
                          key={l}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            router.replace(pathname as "/", { locale: l });
                            setLangOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-2 text-[12px] tracking-wider uppercase transition-colors duration-200 ${
                            active
                              ? "text-[var(--color-primary)] font-semibold"
                              : "text-[var(--color-text-light)] hover:text-[var(--color-dark)] hover:bg-[var(--color-gray-light)]"
                          }`}
                        >
                          <span>{l.toUpperCase()}</span>
                          <span className="text-[10px] normal-case tracking-normal text-[var(--color-text-muted)]">
                            {localeLabels[l]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Link
                href="/contacto"
                className={`px-5 py-2 text-[12px] font-semibold tracking-wider uppercase transition-all duration-300 btn-press ${
                  scrolled
                    ? "bg-[var(--color-dark)] text-white hover:bg-[var(--color-dark-lighter)]"
                    : "bg-white text-[var(--color-dark)] hover:bg-white/90"
                }`}
              >
                {t("presupuesto")}
              </Link>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`lg:hidden p-2 transition-colors duration-300 ${
              scrolled ? "text-[var(--color-dark)]" : "text-white"
            }`}
            aria-label={
              locale === "ca"
                ? "Obrir menú"
                : locale === "en"
                ? "Open menu"
                : "Abrir menú"
            }
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-[1.5px] bg-current transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-current transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] bg-current transition-all duration-300 origin-center ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="px-6 py-6 space-y-1">
              {navItems.map((item) =>
                item.hasDropdown ? (
                  <div key={item.href} className="mobile-services-group">
                    <button
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      aria-expanded={mobileServicesOpen}
                      className={`flex items-center justify-between w-full px-3 py-3 text-[14px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                        pathname.startsWith("/servicios")
                          ? "text-[var(--color-dark)] border-l-2 border-[var(--color-primary)] pl-4"
                          : "text-[var(--color-text-light)]"
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileServicesOpen && (
                      <div className="pl-5 pb-2 space-y-0.5">
                        {serviceSlugs.map((slug) => {
                          const key = serviceKeyMap[slug];
                          return (
                            <Link
                              key={slug}
                              href={{ pathname: "/servicios/[slug]", params: { slug } }}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-3 py-2 text-[13px] text-[var(--color-text-light)] hover:text-[var(--color-dark)] transition-colors duration-200"
                            >
                              {tServices(`items.${key}.nombre`)}
                            </Link>
                          );
                        })}
                        <Link
                          href="/servicios"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-[12px] font-semibold tracking-wider uppercase text-[var(--color-primary)]"
                        >
                          {t("verTodos") || "Ver todos"}
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-3 text-[14px] font-medium tracking-wide uppercase transition-colors duration-300 ${
                      pathname === item.href
                        ? "text-[var(--color-dark)] border-l-2 border-[var(--color-primary)] pl-4"
                        : "text-[var(--color-text-light)] hover:text-[var(--color-dark)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  {allLocales.map((l) => {
                    const active = l === locale;
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          router.replace(pathname as "/", { locale: l });
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 text-[12px] font-medium tracking-wider uppercase transition-colors duration-200 ${
                          active
                            ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-dark)]"
                        }`}
                        aria-current={active ? "true" : undefined}
                      >
                        {l.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
                <Link
                  href="/contacto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2.5 bg-[var(--color-dark)] text-white text-[12px] font-semibold tracking-wider uppercase btn-press"
                >
                  {t("presupuesto")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
