import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { getPosts } from "@/lib/posts";
import { getRequests } from "@/lib/requests";
import { getQueue } from "@/lib/blog/queue";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new: { label: "Nueva", cls: "bg-[var(--brand-red)]/10 text-[var(--brand-red)]" },
  read: { label: "Leída", cls: "bg-amber-100 text-amber-700" },
  replied: { label: "Respondida", cls: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Archivada", cls: "bg-gray-100 text-gray-500" },
};

export default async function DashboardPage() {
  const [projects, posts, requests, queue] = await Promise.all([
    getProjects(),
    getPosts(),
    getRequests(),
    getQueue(),
  ]);

  const newRequests = requests.filter((r) => r.status === "new").length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const inQueue = queue.filter(
    (q) => q.status !== "approved" && q.status !== "failed",
  ).length;

  const latest = [...requests]
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, 5);

  const stats = [
    { href: "/admin/projects", label: "Proyectos", value: projects.length, hint: "en portfolio", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
    { href: "/admin/blog", label: "Posts publicados", value: publishedPosts, hint: `${posts.length} en total`, icon: "M7 3h7l4 4v14H7zM14 3v5h5" },
    { href: "/admin/requests", label: "Solicitudes nuevas", value: newRequests, hint: `${requests.length} en total`, accent: newRequests > 0, icon: "M3 6h18v12H3zM3 7l9 6 9-6" },
    { href: "/admin/blog/queue", label: "Cola IA", value: inQueue, hint: "pendientes", icon: "M13 3 5 13h6l-1 8 9-11h-6z" },
  ];

  return (
    <>
      <AdminPageHeader title="Inicio" subtitle="Resumen del panel">
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
        >
          + Proyecto
        </Link>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-deep)]"
        >
          + Post
        </Link>
      </AdminPageHeader>

      {/* Tarjetas de estado */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] ${
              s.accent ? "border-[var(--brand-red)]/40" : "border-[var(--line)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                  s.accent
                    ? "bg-[var(--brand-red)] text-white"
                    : "bg-[var(--bone)] text-[var(--ink)]"
                }`}
              >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </span>
              <svg className="h-4 w-4 text-[var(--mute-soft)] transition group-hover:translate-x-0.5 group-hover:text-[var(--ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="mt-4 font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
              {s.value}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[var(--ink)]">{s.label}</p>
            <p className="text-xs text-[var(--mute)]">{s.hint}</p>
          </Link>
        ))}
      </div>

      {/* Últimas solicitudes */}
      <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 className="font-display text-lg font-bold text-[var(--ink)]">
            Últimas solicitudes
          </h2>
          <Link
            href="/admin/requests"
            className="text-xs font-semibold text-[var(--brand-red)] hover:text-[var(--brand-red-deep)]"
          >
            Ver todas →
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[var(--mute)]">
            Aún no hay solicitudes.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--line-soft)]">
            {latest.map((r) => {
              const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.new;
              return (
                <li key={r.id}>
                  <Link
                    href={`/admin/requests/${r.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[var(--bone)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">
                        {r.nombre}
                      </p>
                      <p className="truncate text-xs text-[var(--mute)]">
                        {r.servicio ? `${r.servicio} · ` : ""}
                        {r.email}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-[var(--mute-soft)]">
                      {formatDate(r.receivedAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
