import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AdminBackLink href="/admin/projects" label="Volver a proyectos" />
        <h1 className="text-xl font-bold text-gray-900 mb-6">Nuevo proyecto</h1>
        <ProjectForm mode="new" />
      </main>
    </div>
  );
}
