import { AdminNav } from "@/components/admin/AdminNav";
import { getSources } from "@/lib/blog/sources";
import { SourcesManager } from "@/components/admin/SourcesManager";

export const dynamic = "force-dynamic";

export default async function BlogSourcesPage() {
  const sources = await getSources();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Fuentes RSS</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Feeds de los que se importan noticias para que Claude las reescriba.
          </p>
        </div>
        <SourcesManager initial={sources} />
      </main>
    </div>
  );
}
