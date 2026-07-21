import { NextRequest, NextResponse } from "next/server";
import { getPosts, savePosts } from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { revalidatePath } from "next/cache";
import { sanitizePostHtml } from "@/lib/sanitize-post-html";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const posts = await getPosts();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const body = await req.json();
  if (!isValid(body)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const posts = await getPosts();
  if (posts.find((p) => p.slug === body.slug)) {
    return NextResponse.json({ error: "Ese slug ya existe" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const newPost: Post = {
    slug: body.slug,
    titleEs: body.titleEs.trim(),
    titleCa: (body.titleCa ?? "").trim(),
    titleEn: (body.titleEn ?? "").trim(),
    excerptEs: (body.excerptEs ?? "").trim(),
    excerptCa: (body.excerptCa ?? "").trim(),
    excerptEn: (body.excerptEn ?? "").trim(),
    bodyEs: sanitizePostHtml(body.bodyEs ?? ""),
    bodyCa: sanitizePostHtml(body.bodyCa ?? ""),
    bodyEn: sanitizePostHtml(body.bodyEn ?? ""),
    featuredImage: body.featuredImage ?? "",
    categorySlug: body.categorySlug ?? "",
    metaTitleEs: (body.metaTitleEs ?? "").trim(),
    metaTitleCa: (body.metaTitleCa ?? "").trim(),
    metaTitleEn: (body.metaTitleEn ?? "").trim(),
    metaDescriptionEs: (body.metaDescriptionEs ?? "").trim(),
    metaDescriptionCa: (body.metaDescriptionCa ?? "").trim(),
    metaDescriptionEn: (body.metaDescriptionEn ?? "").trim(),
    status: body.status === "published" ? "published" : "draft",
    publishedAt: body.publishedAt || now,
    createdAt: now,
    updatedAt: now,
  };

  await savePosts([...posts, newPost]);
  revalidateAll();
  return NextResponse.json(newPost, { status: 201 });
}

function isValid(b: unknown): b is Partial<Post> & { slug: string; titleEs: string } {
  if (!b || typeof b !== "object") return false;
  const p = b as Record<string, unknown>;
  return (
    typeof p.slug === "string" && /^[a-z0-9-]+$/.test(p.slug) &&
    typeof p.titleEs === "string" && p.titleEs.trim().length > 0
  );
}

function revalidateAll() {
  for (const locale of ["es", "ca", "en"]) {
    revalidatePath(`/${locale}/blog`);
    revalidatePath(`/${locale}`);
  }
  revalidatePath("/sitemap.xml");
}
