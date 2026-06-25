import { getProjects } from "@/lib/projects";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";

type Props = { params: Promise<{ slug: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  return (
    <div className="max-w-3xl">
      <AdminBackLink href="/admin/projects" label="Volver a proyectos" />
      <h1 className="mb-6 mt-2 font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
        Editar: {project.nameEs}
      </h1>
      <ProjectForm mode="edit" initial={project} />
    </div>
  );
}
