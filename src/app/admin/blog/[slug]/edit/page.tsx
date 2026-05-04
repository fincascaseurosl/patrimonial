import { getPosts } from "@/lib/posts";
import { getCategories } from "@/lib/categories";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params;
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const post = posts.find((p) => p.slug === slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <AdminBackLink href="/admin/blog" label="Volver al blog" />
        <h1 className="text-xl font-bold text-gray-900 mb-6">Editar: {post.titleEs}</h1>
        <PostForm mode="edit" initial={post} categories={categories} />
      </main>
    </div>
  );
}
