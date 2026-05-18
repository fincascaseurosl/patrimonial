"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { serviceSlugs, serviceKeyMap } from "@/lib/site-config";

export default function ContactForm({ defaultServicio }: { defaultServicio?: string } = {}) {
  const t = useTranslations("contacto.formulario");
  const tServicios = useTranslations("servicios.items");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      nombre: (form.elements.namedItem("nombre") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      telefono: (form.elements.namedItem("telefono") as HTMLInputElement).value,
      servicio: (form.elements.namedItem("servicio") as HTMLSelectElement).value,
      mensaje: (form.elements.namedItem("mensaje") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-[var(--color-gray-light)] p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-[var(--color-primary)]">
          <svg className="w-6 h-6 text-[var(--color-dark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[var(--color-dark)] font-semibold text-lg">{t("enviado")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="nombre"
            className="block text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3"
          >
            {t("nombre")} *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            required
            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--color-border)] text-[var(--color-dark)] text-sm focus:border-[var(--color-primary)] focus:ring-0 outline-none transition-colors duration-300"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3"
          >
            {t("email")} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--color-border)] text-[var(--color-dark)] text-sm focus:border-[var(--color-primary)] focus:ring-0 outline-none transition-colors duration-300"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="telefono"
            className="block text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3"
          >
            {t("telefono")}
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--color-border)] text-[var(--color-dark)] text-sm focus:border-[var(--color-primary)] focus:ring-0 outline-none transition-colors duration-300"
          />
        </div>
        <div>
          <label
            htmlFor="servicio"
            className="block text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3"
          >
            {t("servicio")} *
          </label>
          <select
            id="servicio"
            name="servicio"
            required
            defaultValue={defaultServicio ?? ""}
            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--color-border)] text-[var(--color-dark)] text-sm focus:border-[var(--color-primary)] focus:ring-0 outline-none transition-colors duration-300 cursor-pointer"
          >
            <option value="" disabled>
              {t("servicioPlaceholder")}
            </option>
            {serviceSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {tServicios(`${serviceKeyMap[slug]}.nombre`)}
              </option>
            ))}
            <option value="otro">{t("servicioOtro")}</option>
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="mensaje"
          className="block text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3"
        >
          {t("mensaje")} *
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={6}
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--color-border)] text-[var(--color-dark)] text-sm focus:border-[var(--color-primary)] focus:ring-0 outline-none transition-colors duration-300 resize-y"
        />
      </div>

      {status === "error" && (
        <div className="bg-red-50/50 p-4">
          <p className="text-red-600 text-sm">{t("error")}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="px-10 py-4 bg-[var(--color-dark)] text-white text-[13px] font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-[var(--color-dark-lighter)] disabled:opacity-40 disabled:cursor-not-allowed btn-press"
      >
        {status === "sending" ? "..." : t("enviar")}
      </button>
    </form>
  );
}
