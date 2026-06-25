import { getCategories } from "@/lib/categories";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return (
    <>
      <AdminPageHeader
        title="Categorías del blog"
        subtitle={`Agrupan los posts del blog. ${categories.length} en total.`}
      />
      <div className="max-w-3xl">
        <CategoriesManager initial={categories} />
      </div>
    </>
  );
}
