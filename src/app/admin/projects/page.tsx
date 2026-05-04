import { getProjects } from "@/lib/projects";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function ProjectsAdminPage() {
  const projects = await getProjects();
  const sorted = [...projects].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Proyectos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proyecto
          </Link>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Aún no hay proyectos</p>
            <p className="text-sm mt-1">Crea el primero con el botón de arriba</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((project) => (
              <div
                key={project.slug}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
              >
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {project.images[0] && (
                    <img src={project.images[0]} alt={project.nameEs} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{project.nameEs}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {project.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {project.images.length} foto{project.images.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/projects/${project.slug}/edit`}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Editar
                  </Link>
                  <DeleteButton slug={project.slug} name={project.nameEs} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
