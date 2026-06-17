import { AdminNav } from "@/components/admin/AdminNav";
import { getQueue } from "@/lib/blog/queue";
import { getCategories } from "@/lib/categories";
import { notFound } from "next/navigation";
import Link from "next/link";
import { QueueDraftEditor } from "@/components/admin/QueueDraftEditor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function QueueItemEditPage({ params }: Props) {
  const { id } = await params;
  const [queue, categories] = await Promise.all([getQueue(), getCategories()]);
  const item = queue.find((q) => q.id === id);
  if (!item) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/admin/blog/queue"
          className="text-sm text-gray-500 hover:text-gray-900 mb-4 inline-block"
        >
          ← Volver a la cola
        </Link>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Revisar borrador IA</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Fuente: <strong>{item.sourceName}</strong> ·{" "}
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              ver original ↗
            </a>
          </p>
        </div>
        <QueueDraftEditor initial={item} categories={categories} />
      </main>
    </div>
  );
}
