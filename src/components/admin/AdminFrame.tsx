"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

// Envoltorio del panel: el login va sin sidebar; el resto con el armazón completo.
export function AdminFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-[var(--bone)]">
      <AdminSidebar />
      <div className="lg:pl-60">
        <main className="mx-auto max-w-6xl px-5 py-7 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
