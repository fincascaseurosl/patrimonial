import { getCategories } from "@/lib/categories";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-3xl">
      <AdminBackLink href="/admin/blog" label="Volver al blog" />
      <h1 className="mb-6 mt-2 font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
        Nuevo post
      </h1>
      <PostForm mode="new" categories={categories} />
    </div>
  );
}
