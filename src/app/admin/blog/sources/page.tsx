import { getSources } from "@/lib/blog/sources";
import { SourcesManager } from "@/components/admin/SourcesManager";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function BlogSourcesPage() {
  const sources = await getSources();

  return (
    <>
      <AdminPageHeader
        title="Fuentes RSS"
        subtitle="Feeds de los que se importan noticias para que Claude las reescriba."
      />
      <SourcesManager initial={sources} />
    </>
  );
}
