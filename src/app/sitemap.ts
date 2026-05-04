import type { MetadataRoute } from "next";
import { serviceSlugs } from "@/lib/site-config";
import { getProjects } from "@/lib/projects";
import { getPublicPosts } from "@/lib/posts";

const BASE_URL = "https://obrasenbarcelona.es";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ["es", "ca"] as const;
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0 },
    { path: "/servicios", priority: 0.9 },
    { path: "/portfolio", priority: 0.8 },
    { path: "/sobre-nosotros", priority: 0.7 },
    { path: "/contacto", priority: 0.8 },
    { path: "/blog", priority: 0.6 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: page.priority,
        alternates: {
          languages: {
            es: `${BASE_URL}/es${page.path}`,
            ca: `${BASE_URL}/ca${page.path}`,
          },
        },
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/servicios/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // Proyectos dinámicos
  const projects = await getProjects();
  for (const project of projects) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/portfolio/${project.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Posts del blog dinámicos
  const posts = await getPublicPosts();
  for (const post of posts) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
