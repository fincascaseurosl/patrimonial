import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-700 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <span className="font-semibold text-gray-900 text-sm">Nuevo proyecto</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <ProjectForm mode="new" />
      </main>
    </div>
  );
}
