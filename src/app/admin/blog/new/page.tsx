import { getCategories } from "@/lib/categories";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AdminBackLink href="/admin/blog" label="Volver al blog" />
        <h1 className="text-xl font-bold text-gray-900 mb-6">Nuevo post</h1>
        <PostForm mode="new" categories={categories} />
      </main>
    </div>
  );
}
