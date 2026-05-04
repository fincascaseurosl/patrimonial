import { getPosts } from "@/lib/posts";
import { getCategories } from "@/lib/categories";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default async function BlogAdminPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Blog</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {posts.length} post{posts.length !== 1 ? "s" : ""}
              {" · "}
              {posts.filter((p) => p.status === "published").length} publicado{posts.filter((p) => p.status === "published").length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo post
          </Link>
        </div>

        {categories.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
            No tienes categorías creadas todavía. <Link href="/admin/categories" className="font-semibold underline">Crear primera categoría →</Link>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Aún no hay posts</p>
            <p className="text-sm mt-1">Crea el primero con el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((post) => {
              const category = categories.find((c) => c.slug === post.categorySlug);
              const isScheduled = post.status === "published" && new Date(post.publishedAt).getTime() > Date.now();
              return (
                <div
                  key={post.slug}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {post.featuredImage && (
                      <img src={post.featuredImage} alt={post.titleEs} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.status === "draft" ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Borrador</span>
                      ) : isScheduled ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Programado</span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-0.5 rounded">Publicado</span>
                      )}
                      {category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {category.nameEs}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{post.titleEs}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.publishedAt)}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/blog/${post.slug}/edit`}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
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
      </main>
    </div>
  );
}
