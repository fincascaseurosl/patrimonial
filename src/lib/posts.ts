import { put, del, list } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export type PostStatus = "draft" | "published";

export type Post = {
  slug: string;
  titleEs: string;
  titleCa: string;
  titleEn: string;
  excerptEs: string;
  excerptCa: string;
  excerptEn: string;
  bodyEs: string; // HTML del editor
  bodyCa: string;
  bodyEn: string;
  featuredImage: string;
  categorySlug: string;
  metaTitleEs: string;
  metaTitleCa: string;
  metaTitleEn: string;
  metaDescriptionEs: string;
  metaDescriptionCa: string;
  metaDescriptionEn: string;
  status: PostStatus;
  publishedAt: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
};

const BLOB_KEY = "posts.json";
const LOCAL_DIR = join(process.cwd(), "data");
const LOCAL_FILE = join(LOCAL_DIR, "posts.json");

const NOW = () => new Date().toISOString();

const DEFAULTS: Post[] = [
  {
    slug: "como-detectar-amianto-en-viviendas",
    titleEs: "Cómo detectar amianto en viviendas",
    titleCa: "Com detectar amiant a habitatges",
    titleEn: "How to spot asbestos in homes",
    excerptEs:
      "Si tu vivienda fue construida antes de 2002, es posible que contenga materiales con amianto. Te explicamos cómo detectarlo y qué hacer.",
    excerptCa:
      "Si el teu habitatge va ser construït abans del 2002, és possible que contingui materials amb amiant. T'expliquem com detectar-lo i què fer.",
    excerptEn:
      "If your home was built before 2002, it may contain asbestos-containing materials. We explain how to spot it and what to do.",
    bodyEs: "",
    bodyCa: "",
    bodyEn: "",
    featuredImage: "/images/blog/amianto.jpg",
    categorySlug: "amianto",
    metaTitleEs: "",
    metaTitleCa: "",
    metaTitleEn: "",
    metaDescriptionEs: "",
    metaDescriptionCa: "",
    metaDescriptionEn: "",
    status: "published",
    publishedAt: "2018-01-15T00:00:00.000Z",
    createdAt: "2018-01-15T00:00:00.000Z",
    updatedAt: "2018-01-15T00:00:00.000Z",
  },
  {
    slug: "reformas-integrales-barcelona-guia",
    titleEs: "Guía de reformas integrales en Barcelona",
    titleCa: "Guia de reformes integrals a Barcelona",
    titleEn: "Full renovations in Barcelona: a guide",
    excerptEs:
      "Todo lo que necesitas saber antes de hacer una reforma integral: permisos, plazos, presupuesto y cómo elegir la empresa adecuada.",
    excerptCa:
      "Tot el que necessites saber abans de fer una reforma integral: permisos, terminis, pressupost i com triar l'empresa adequada.",
    excerptEn:
      "Everything you need to know before a full renovation: permits, schedule, budget and how to choose the right firm.",
    bodyEs: "",
    bodyCa: "",
    bodyEn: "",
    featuredImage: "/images/blog/reformas.jpg",
    categorySlug: "reformas",
    metaTitleEs: "",
    metaTitleCa: "",
    metaTitleEn: "",
    metaDescriptionEs: "",
    metaDescriptionCa: "",
    metaDescriptionEn: "",
    status: "published",
    publishedAt: "2018-03-20T00:00:00.000Z",
    createdAt: "2018-03-20T00:00:00.000Z",
    updatedAt: "2018-03-20T00:00:00.000Z",
  },
];

export async function getPosts(): Promise<Post[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY });
      const blob = blobs.find((b) => b.pathname === BLOB_KEY);
      if (!blob) return DEFAULTS;
      const res = await fetch(blob.url, { next: { revalidate: 60 } } as RequestInit);
      return await res.json();
    } catch {
      return DEFAULTS;
    }
  }
  if (!existsSync(LOCAL_FILE)) return DEFAULTS;
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return DEFAULTS;
  }
}

export async function savePosts(posts: Post[]): Promise<void> {
  const body = JSON.stringify(posts);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { blobs } = await list({ prefix: BLOB_KEY });
    await Promise.all(blobs.map((b) => del(b.url)));
    await put(BLOB_KEY, body, { access: "public", addRandomSuffix: false });
  } else {
    if (!existsSync(LOCAL_DIR)) mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(LOCAL_FILE, JSON.stringify(posts, null, 2));
  }
}

/** Posts visibles públicamente: published + publishedAt ya pasado */
export async function getPublicPosts(): Promise<Post[]> {
  const posts = await getPosts();
  const now = Date.now();
  return posts
    .filter((p) => p.status === "published" && new Date(p.publishedAt).getTime() <= now)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostTitle(post: Post, locale: string): string {
  if (locale === "ca") return post.titleCa || post.titleEs || post.titleEn;
  if (locale === "en") return post.titleEn || post.titleEs || post.titleCa;
  return post.titleEs || post.titleCa || post.titleEn;
}

export function getPostExcerpt(post: Post, locale: string): string {
  if (locale === "ca") return post.excerptCa || post.excerptEs || post.excerptEn;
  if (locale === "en") return post.excerptEn || post.excerptEs || post.excerptCa;
  return post.excerptEs || post.excerptCa || post.excerptEn;
}

export function getPostBody(post: Post, locale: string): string {
  if (locale === "ca") return post.bodyCa || post.bodyEs || post.bodyEn;
  if (locale === "en") return post.bodyEn || post.bodyEs || post.bodyCa;
  return post.bodyEs || post.bodyCa || post.bodyEn;
}

export function getPostMetaTitle(post: Post, locale: string): string {
  if (locale === "ca")
    return post.metaTitleCa || post.titleCa || post.titleEs || post.titleEn;
  if (locale === "en")
    return post.metaTitleEn || post.titleEn || post.titleEs || post.titleCa;
  return post.metaTitleEs || post.titleEs || post.titleCa || post.titleEn;
}

export function getPostMetaDescription(post: Post, locale: string): string {
  if (locale === "ca")
    return (
      post.metaDescriptionCa || post.excerptCa || post.excerptEs || post.excerptEn
    );
  if (locale === "en")
    return (
      post.metaDescriptionEn || post.excerptEn || post.excerptEs || post.excerptCa
    );
  return (
    post.metaDescriptionEs || post.excerptEs || post.excerptCa || post.excerptEn
  );
}

/** Estima el tiempo de lectura en minutos a partir del HTML */
export function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 200));
}
