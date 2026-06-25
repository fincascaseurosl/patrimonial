import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

export default function NewProjectPage() {
  return (
    <div className="max-w-3xl">
      <AdminBackLink href="/admin/projects" label="Volver a proyectos" />
      <h1 className="mb-6 mt-2 font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
        Nuevo proyecto
      </h1>
      <ProjectForm mode="new" />
    </div>
  );
}
