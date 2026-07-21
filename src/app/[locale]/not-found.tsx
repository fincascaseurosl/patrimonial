import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="bg-[var(--paper)] min-h-[70vh] flex items-center py-32">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-[var(--brand-red)] text-[11px] font-semibold tracking-[0.32em] uppercase mb-6">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-[var(--ink)] text-4xl md:text-6xl font-bold leading-[1.05] tracking-[-0.03em] text-balance mb-6">
          {t("titulo")}
        </h1>
        <p className="text-[var(--ink-soft)] text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-12">
          {t("texto")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-9 py-5 bg-[var(--brand-red)] text-white text-[12px] font-semibold tracking-[0.18em] uppercase transition-colors duration-300 hover:bg-[var(--brand-red-deep)]"
          >
            {t("inicio")}
          </Link>
          <Link
            href="/servicios"
            className="inline-flex items-center justify-center px-9 py-5 border border-[var(--line)] text-[var(--ink)] text-[12px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:border-[var(--ink)]"
          >
            {t("servicios")}
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-9 py-5 border border-[var(--line)] text-[var(--ink)] text-[12px] font-medium tracking-[0.18em] uppercase transition-all duration-300 hover:border-[var(--ink)]"
          >
            {t("contacto")}
          </Link>
        </div>
      </div>
    </section>
  );
}
