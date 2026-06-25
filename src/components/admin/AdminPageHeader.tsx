// Cabecera de sección reutilizable: título + subtítulo + acciones a la derecha.
export function AdminPageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--mute)]">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  );
}
