import { AdminNav } from "@/components/admin/AdminNav";
import { getQueue } from "@/lib/blog/queue";
import { QueueManager } from "@/components/admin/QueueManager";

export const dynamic = "force-dynamic";

export default async function BlogQueuePage() {
  const queue = await getQueue();
  const sorted = [...queue].sort((a, b) => {
    const ap = a.sourcePublishedAt || a.ingestedAt;
    const bp = b.sourcePublishedAt || b.ingestedAt;
    return bp.localeCompare(ap);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Cola IA</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Artículos ingeridos desde las fuentes RSS, listos para que Claude los reescriba.
          </p>
        </div>
        <QueueManager initial={sorted} />
      </main>
    </div>
  );
}
