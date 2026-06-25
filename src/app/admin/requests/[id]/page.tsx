import { getRequests } from "@/lib/requests";
import { notFound } from "next/navigation";
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
    <div className="max-w-3xl">
      <AdminBackLink href="/admin/requests" label="Volver a solicitudes" />
      <div className="mt-2">
        <RequestDetail initial={req} />
      </div>
    </div>
  );
}
