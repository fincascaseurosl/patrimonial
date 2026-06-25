import { getQueue } from "@/lib/blog/queue";
import { QueueManager } from "@/components/admin/QueueManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function BlogQueuePage() {
  const queue = await getQueue();
  const sorted = [...queue].sort((a, b) => {
    const ap = a.sourcePublishedAt || a.ingestedAt;
    const bp = b.sourcePublishedAt || b.ingestedAt;
    return bp.localeCompare(ap);
  });

  return (
    <>
      <AdminPageHeader
        title="Cola IA"
        subtitle="Artículos ingeridos desde las fuentes RSS, listos para que Claude los reescriba."
      />
      <QueueManager initial={sorted} />
    </>
  );
}
