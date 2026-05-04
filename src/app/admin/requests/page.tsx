import { getRequests } from "@/lib/requests";
import { AdminNav } from "@/components/admin/AdminNav";
import { RequestsList } from "@/components/admin/RequestsList";

export const dynamic = "force-dynamic";

export default async function RequestsAdminPage() {
  const requests = await getRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {requests.length} solicitud{requests.length !== 1 ? "es" : ""} en total
          </p>
        </div>
        <RequestsList initial={requests} />
      </main>
    </div>
  );
}
