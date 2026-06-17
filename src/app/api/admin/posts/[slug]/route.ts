import { NextRequest, NextResponse } from "next/server";
import { getPosts, savePosts } from "@/lib/posts";
import { revalidatePath } from "next/cache";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const body = await req.json();

  const posts = await getPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (typeof body.titleEs !== "string" || !body.titleEs.trim()) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  posts[idx] = {
    ...posts[idx],
    titleEs: body.titleEs.trim(),
    titleCa: (body.titleCa ?? "").trim(),
    titleEn: (body.titleEn ?? "").trim(),
    excerptEs: (body.excerptEs ?? "").trim(),
    excerptCa: (body.excerptCa ?? "").trim(),
    excerptEn: (body.excerptEn ?? "").trim(),
    bodyEs: body.bodyEs ?? "",
    bodyCa: body.bodyCa ?? "",
    bodyEn: body.bodyEn ?? "",
    featuredImage: body.featuredImage ?? "",
    categorySlug: body.categorySlug ?? "",
    metaTitleEs: (body.metaTitleEs ?? "").trim(),
    metaTitleCa: (body.metaTitleCa ?? "").trim(),
    metaTitleEn: (body.metaTitleEn ?? "").trim(),
    metaDescriptionEs: (body.metaDescriptionEs ?? "").trim(),
    metaDescriptionCa: (body.metaDescriptionCa ?? "").trim(),
    metaDescriptionEn: (body.metaDescriptionEn ?? "").trim(),
    status: body.status === "published" ? "published" : "draft",
    publishedAt: body.publishedAt || posts[idx].publishedAt,
    updatedAt: new Date().toISOString(),
  };

  await savePosts(posts);
  revalidateAll(slug);
  return NextResponse.json(posts[idx]);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const posts = await getPosts();
  const filtered = posts.filter((p) => p.slug !== slug);
  if (filtered.length === posts.length) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  await savePosts(filtered);
  revalidateAll(slug);
  return NextResponse.json({ ok: true });
}

function revalidateAll(slug: string) {
  for (const locale of ["es", "ca", "en"]) {
    revalidatePath(`/${locale}/blog`);
    revalidatePath(`/${locale}/blog/${slug}`);
    revalidatePath(`/${locale}`);
  }
  revalidatePath("/sitemap.xml");
}
