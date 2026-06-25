import { getQueue } from "@/lib/blog/queue";
import { getCategories } from "@/lib/categories";
import { notFound } from "next/navigation";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { QueueDraftEditor } from "@/components/admin/QueueDraftEditor";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function QueueItemEditPage({ params }: Props) {
  const { id } = await params;
  const [queue, categories] = await Promise.all([getQueue(), getCategories()]);
  const item = queue.find((q) => q.id === id);
  if (!item) notFound();

  return (
    <>
      <AdminBackLink href="/admin/blog/queue" label="Volver a la cola" />
      <div className="mb-6 mt-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
          Revisar borrador IA
        </h1>
        <p className="mt-1 text-sm text-[var(--mute)]">
          Fuente: <strong className="text-[var(--ink-soft)]">{item.sourceName}</strong> ·{" "}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-red)] underline"
          >
            ver original ↗
          </a>
        </p>
      </div>
      <QueueDraftEditor initial={item} categories={categories} />
    </>
  );
}
