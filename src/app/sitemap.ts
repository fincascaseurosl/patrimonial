import type { MetadataRoute } from "next";
import { serviceSlugs } from "@/lib/site-config";
import { getProjects } from "@/lib/projects";
import { getPublicPosts } from "@/lib/posts";

const BASE_URL = "https://obrasenbarcelona.es";

export const revalidate = 60;

type Locale = "es" | "ca" | "en";
const locales: readonly Locale[] = ["es", "ca", "en"] as const;

const localizedPaths = {
  home: { es: "", ca: "", en: "" },
  servicios: { es: "/servicios", ca: "/serveis", en: "/services" },
  portfolio: { es: "/portfolio", ca: "/portfolio", en: "/portfolio" },
  sobreNosotros: {
    es: "/sobre-nosotros",
    ca: "/sobre-nosaltres",
    en: "/about-us",
  },
  contacto: { es: "/contacto", ca: "/contacte", en: "/contact" },
  blog: { es: "/blog", ca: "/blog", en: "/blog" },
  casa: {
    es: "/construir-casa-a-medida",
    ca: "/construir-casa-a-mida",
    en: "/build-a-custom-home",
  },
} as const;

type PageKey = keyof typeof localizedPaths;

function buildLanguageAlternates(pathBuilder: (locale: Locale) => string) {
  return {
    es: `${BASE_URL}/es${pathBuilder("es")}`,
    ca: `${BASE_URL}/ca${pathBuilder("ca")}`,
    en: `${BASE_URL}/en${pathBuilder("en")}`,
    "x-default": `${BASE_URL}/es${pathBuilder("es")}`,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: { key: PageKey; priority: number }[] = [
    { key: "home", priority: 1.0 },
    { key: "servicios", priority: 0.9 },
    { key: "casa", priority: 0.85 },
    { key: "portfolio", priority: 0.8 },
    { key: "sobreNosotros", priority: 0.7 },
    { key: "contacto", priority: 0.8 },
    { key: "blog", priority: 0.6 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    const paths = localizedPaths[page.key];
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${paths[locale]}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: page.priority,
        alternates: {
          languages: buildLanguageAlternates((l) => paths[l]),
        },
      });
    }
  }

  for (const slug of serviceSlugs) {
    const base = localizedPaths.servicios;
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${base[locale]}/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: buildLanguageAlternates((l) => `${base[l]}/${slug}`),
        },
      });
    }
  }

  const projects = await getProjects();
  for (const project of projects) {
    const base = localizedPaths.portfolio;
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${base[locale]}/${project.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: buildLanguageAlternates(
            (l) => `${base[l]}/${project.slug}`,
          ),
        },
      });
    }
  }

  const posts = await getPublicPosts();
  for (const post of posts) {
    const base = localizedPaths.blog;
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${base[locale]}/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: buildLanguageAlternates(
            (l) => `${base[l]}/${post.slug}`,
          ),
        },
      });
    }
  }

  return entries;
}
