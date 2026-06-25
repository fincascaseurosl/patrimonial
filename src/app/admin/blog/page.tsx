import { getPosts } from "@/lib/posts";
import { getCategories } from "@/lib/categories";
import Link from "next/link";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogAdminPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const published = posts.filter((p) => p.status === "published").length;
  // Hora de la petición: válida aquí porque es un Server Component dinámico (force-dynamic).
  // eslint-disable-next-line react-hooks/purity -- Date.now() es correcto en un render de servidor por petición
  const now = Date.now();

  return (
    <>
      <AdminPageHeader
        title="Blog"
        subtitle={`${posts.length} post${posts.length !== 1 ? "s" : ""} · ${published} publicado${published !== 1 ? "s" : ""}`}
      >
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-deep)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo post
        </Link>
      </AdminPageHeader>

      {categories.length === 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No tienes categorías creadas todavía.{" "}
          <Link href="/admin/categories" className="font-semibold underline">
            Crear primera categoría →
          </Link>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white py-20 text-center">
          <p className="font-display text-lg font-bold text-[var(--ink)]">
            Aún no hay posts
          </p>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Crea el primero con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((post) => {
            const category = categories.find((c) => c.slug === post.categorySlug);
            const isScheduled =
              post.status === "published" &&
              new Date(post.publishedAt).getTime() > now;
            return (
              <div
                key={post.slug}
                className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-white p-3.5 transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--bone-deep)]">
                  {post.featuredImage && (
                    /* eslint-disable-next-line @next/next/no-img-element -- preview interno de admin */
                    <img
                      src={post.featuredImage}
                      alt={post.titleEs}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {post.status === "draft" ? (
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700">
                        Borrador
                      </span>
                    ) : isScheduled ? (
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                        Programado
                      </span>
                    ) : (
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        Publicado
                      </span>
                    )}
                    {category && (
                      <span className="rounded-full bg-[var(--bone)] px-2 py-0.5 text-xs font-medium text-[var(--ink-soft)]">
                        {category.nameEs}
                      </span>
                    )}
                  </div>
                  <p className="truncate font-semibold text-[var(--ink)]">
                    {post.titleEs}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--mute-soft)]">
                    {formatDate(post.publishedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/blog/${post.slug}/edit`}
                    className="rounded-lg bg-[var(--bone)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--bone-deep)]"
                  >
                    Editar
                  </Link>
                  <DeletePostButton slug={post.slug} title={post.titleEs} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
