import { getProjects } from "@/lib/projects";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

type Props = { params: Promise<{ slug: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AdminBackLink href="/admin/projects" label="Volver a proyectos" />
        <h1 className="text-xl font-bold text-gray-900 mb-6">Editar: {project.nameEs}</h1>
        <ProjectForm mode="edit" initial={project} />
      </main>
    </div>
  );
}
