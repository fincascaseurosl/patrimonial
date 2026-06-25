"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error ?? "Error al iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ink)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-red)] text-xl font-bold text-white">
            P
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-white/40">Patrimonial Obras Barcelona</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[var(--line)] bg-white p-8 shadow-xl"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[var(--brand-red)]/10 px-3 py-2 text-sm text-[var(--brand-red)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-deep)] disabled:opacity-60"
          >
            {loading ? "Accediendo…" : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  );
}
