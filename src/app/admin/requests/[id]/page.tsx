import { getRequests } from "@/lib/requests";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { RequestDetail } from "@/components/admin/RequestDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function RequestDetailPage({ params }: Props) {
  const { id } = await params;
  const requests = await getRequests();
  const req = requests.find((r) => r.id === id);

  if (!req) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AdminBackLink href="/admin/requests" label="Volver a solicitudes" />
        <RequestDetail initial={req} />
      </main>
    </div>
  );
}
