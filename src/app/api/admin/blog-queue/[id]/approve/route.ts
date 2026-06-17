import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getQueue, saveQueue } from "@/lib/blog/queue";
import { getPosts, savePosts, type Post } from "@/lib/posts";
import { requireAdmin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const publish = !!body?.publish;

  const queue = await getQueue();
  const item = queue.find((q) => q.id === id);
  if (!item) {
    return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  }

  if (!item.aiTitleEs || !item.aiBodyEs || !item.aiSlug) {
    return NextResponse.json(
      { error: "El artículo aún no ha sido reescrito por la IA" },
      { status: 400 },
    );
  }

  const posts = await getPosts();
  if (posts.find((p) => p.slug === item.aiSlug)) {
    return NextResponse.json(
      { error: `Ya existe un post con slug "${item.aiSlug}". Edita el slug en la cola antes de aprobar.` },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const newPost: Post = {
    slug: item.aiSlug,
    titleEs: item.aiTitleEs,
    titleCa: item.aiTitleCa ?? "",
    titleEn: item.aiTitleEn ?? "",
    excerptEs: item.aiExcerptEs ?? "",
    excerptCa: item.aiExcerptCa ?? "",
    excerptEn: item.aiExcerptEn ?? "",
    bodyEs: item.aiBodyEs,
    bodyCa: item.aiBodyCa ?? "",
    bodyEn: item.aiBodyEn ?? "",
    featuredImage: item.sourceImage ?? "",
    categorySlug: item.aiCategorySlug ?? "",
    metaTitleEs: item.aiMetaTitleEs ?? "",
    metaTitleCa: item.aiMetaTitleCa ?? "",
    metaTitleEn: item.aiMetaTitleEn ?? "",
    metaDescriptionEs: item.aiMetaDescriptionEs ?? "",
    metaDescriptionCa: item.aiMetaDescriptionCa ?? "",
    metaDescriptionEn: item.aiMetaDescriptionEn ?? "",
    status: publish ? "published" : "draft",
    publishedAt: publish ? now : now,
    createdAt: now,
    updatedAt: now,
  };

  await savePosts([...posts, newPost]);

  const updatedQueue = queue.map((q) =>
    q.id === id
      ? {
          ...q,
          status: "approved" as const,
          reviewedAt: now,
          blogPostSlug: newPost.slug,
        }
      : q,
  );
  await saveQueue(updatedQueue);

  for (const locale of ["es", "ca", "en"]) {
    revalidatePath(`/${locale}/blog`);
    revalidatePath(`/${locale}/blog/${newPost.slug}`);
    revalidatePath(`/${locale}`);
  }
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ post: newPost, queueId: id });
}
