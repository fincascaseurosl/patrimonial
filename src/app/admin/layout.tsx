import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { AdminFrame } from "@/components/admin/AdminFrame";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "Admin – Patrimonial Obras",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={interTight.variable}>
      <body className="min-h-screen bg-[var(--bone)] font-sans text-[var(--ink)] antialiased">
        <AdminFrame>{children}</AdminFrame>
      </body>
    </html>
  );
}
