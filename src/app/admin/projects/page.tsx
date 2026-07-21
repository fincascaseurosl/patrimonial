import { getProjects } from "@/lib/projects";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function ProjectsAdminPage() {
  const projects = await getProjects();
  const sorted = [...projects].sort((a, b) => a.order - b.order);

  return (
    <>
      <AdminPageHeader
        title="Proyectos"
        subtitle={`${projects.length} proyecto${projects.length !== 1 ? "s" : ""} en el portfolio`}
      >
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-red-deep)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo proyecto
        </Link>
      </AdminPageHeader>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white py-20 text-center">
          <p className="font-display text-lg font-bold text-[var(--ink)]">
            Aún no hay proyectos
          </p>
          <p className="mt-1 text-sm text-[var(--mute)]">
            Crea el primero con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((project) => (
            <div
              key={project.slug}
              className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-white p-3.5 transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
            >
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--bone-deep)]">
                {project.images[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element -- preview interno de admin */
                  <img
                    src={project.images[0]}
                    alt={project.nameEs}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--ink)]">
                  {project.nameEs}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--bone)] px-2 py-0.5 text-xs font-medium text-[var(--ink-soft)]">
                    {project.category}
                  </span>
                  <span className="text-xs text-[var(--mute-soft)]">
                    {project.images.length} foto{project.images.length !== 1 ? "s" : ""}
                  </span>
                  {project.featured && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Destacado
                    </span>
                  )}
                  {project.isCasa && (
                    <span className="rounded-full bg-[var(--brand-red)]/10 px-2 py-0.5 text-xs font-medium text-[var(--brand-red)]">
                      Casa construida
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/projects/${project.slug}/edit`}
                  className="rounded-lg bg-[var(--bone)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--bone-deep)]"
                >
                  Editar
                </Link>
                <DeleteButton slug={project.slug} name={project.nameEs} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
