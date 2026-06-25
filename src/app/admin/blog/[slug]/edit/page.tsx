import { getPosts } from "@/lib/posts";
import { getCategories } from "@/lib/categories";
import { notFound } from "next/navigation";
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
    <div className="max-w-3xl">
      <AdminBackLink href="/admin/blog" label="Volver al blog" />
      <h1 className="mb-6 mt-2 font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
        Editar: {post.titleEs}
      </h1>
      <PostForm mode="edit" initial={post} categories={categories} />
    </div>
  );
}
