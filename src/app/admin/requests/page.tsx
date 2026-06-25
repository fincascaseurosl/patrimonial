import { getRequests } from "@/lib/requests";
import { RequestsList } from "@/components/admin/RequestsList";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function RequestsAdminPage() {
  const requests = await getRequests();

  return (
    <>
      <AdminPageHeader
        title="Solicitudes"
        subtitle={`${requests.length} solicitud${requests.length !== 1 ? "es" : ""} de contacto en total`}
      />
      <RequestsList initial={requests} />
    </>
  );
}
