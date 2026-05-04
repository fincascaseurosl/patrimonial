import { getCategories } from "@/lib/categories";
import { AdminNav } from "@/components/admin/AdminNav";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Categorías del blog</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Las categorías agrupan los posts del blog. {categories.length} en total.
          </p>
        </div>
        <CategoriesManager initial={categories} />
      </main>
    </div>
  );
}
