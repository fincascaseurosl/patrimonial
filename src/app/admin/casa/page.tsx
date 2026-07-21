import { getCasaConfig, DEFAULT_PROCESO_IMAGES } from "@/lib/casa-config";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CasaProcesoForm } from "@/components/admin/CasaProcesoForm";

export const dynamic = "force-dynamic";

export default async function CasaAdminPage() {
  const config = await getCasaConfig();

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title="Construye tu casa"
        subtitle="Fotos del proceso — una por cada fase (se muestran en el scroll horizontal de la página)"
      />
      <CasaProcesoForm
        initialImages={config.procesoImages}
        defaults={DEFAULT_PROCESO_IMAGES}
      />
    </div>
  );
}
