import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import {
  getPublicPosts,
  getPostTitle,
  getPostExcerpt,
  getPostBody,
  getPostMetaTitle,
  getPostMetaDescription,
  readingTime,
} from "@/lib/posts";
import type { Post } from "@/lib/posts";
import { getCategories, getCategoryName } from "@/lib/categories";
import type { Category } from "@/lib/categories";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const posts = await getPublicPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const posts = await getPublicPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};

  const title = getPostMetaTitle(post, locale);
  const description = getPostMetaDescription(post, locale);
  const ogImage = post.featuredImage?.startsWith("http")
    ? post.featuredImage
    : `${siteConfig.url}${post.featuredImage}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        es: `/es/blog/${slug}`,
        ca: `/ca/blog/${slug}`,
        en: `/en/blog/${slug}`,
        "x-default": `/es/blog/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: post.featuredImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImage ? [ogImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  const [posts, categories] = await Promise.all([getPublicPosts(), getCategories()]);
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  setRequestLocale(locale);

  // Posts relacionados: misma categoría, distinto slug, máx 3
  const related = posts
    .filter((p) => p.categorySlug === post.categorySlug && p.slug !== post.slug)
    .slice(0, 3);

  return <PostContent post={post} related={related} categories={categories} locale={locale} />;
}

function PostContent({ post, related, categories, locale }: {
  post: Post;
  related: Post[];
  categories: Category[];
  locale: string;
}) {
  const t = useTranslations();
  const title = getPostTitle(post, locale);
  const excerpt = getPostExcerpt(post, locale);
  const body = getPostBody(post, locale);
  const category = categories.find((c) => c.slug === post.categorySlug);
  const minutes = readingTime(body);
  const date = new Date(post.publishedAt);
  const dateLocale = locale === "ca" ? "ca-ES" : locale === "en" ? "en-GB" : "es-ES";
  const formattedDate = date.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // JSON-LD Article
  const ogImage = post.featuredImage?.startsWith("http")
    ? post.featuredImage
    : `${siteConfig.url}${post.featuredImage}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    image: post.featuredImage ? [ogImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: siteConfig.nombre },
    publisher: {
      "@type": "Organization",
      name: siteConfig.nombre,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/images/logo/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/${locale}/blog/${post.slug}`,
    },
    articleSection: category ? getCategoryName(category, locale) : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <article>
        <header className="relative bg-[var(--color-dark)] text-white pt-32 pb-12 md:pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <nav className="text-[12px] tracking-wider uppercase text-white/40 mb-8">
              <Link href="/" className="hover:text-white/70 transition-colors duration-300">
                {t("nav.inicio")}
              </Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-white/70 transition-colors duration-300">
                Blog
              </Link>
              {category && (
                <>
                  <span className="mx-2">/</span>
                  <Link href={`/blog?cat=${category.slug}` as never} className="hover:text-white/70 transition-colors duration-300">
                    {getCategoryName(category, locale)}
                  </Link>
                </>
              )}
            </nav>

            {category && (
              <p className="text-[var(--color-primary)] text-[11px] font-semibold tracking-[0.3em] uppercase mb-4">
                {getCategoryName(category, locale)}
              </p>
            )}

            <h1 className="text-3xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.1] mb-6">
              {title}
            </h1>

            <div className="flex items-center gap-4 text-[12px] text-white/50 tracking-wider uppercase">
              <time dateTime={post.publishedAt}>{formattedDate}</time>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>
                {minutes} min{" "}
                {locale === "ca"
                  ? "de lectura"
                  : locale === "en"
                  ? "read"
                  : "de lectura"}
              </span>
            </div>
          </div>
        </header>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="bg-[var(--bone-deep)]">
            <div className="max-w-5xl mx-auto">
              <img
                src={post.featuredImage}
                alt={title}
                className="w-full aspect-[16/9] object-cover"
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="bg-[var(--paper)] py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-6">
            {excerpt && (
              <p className="text-xl text-[var(--ink)] leading-relaxed mb-10 font-medium border-l-2 border-[var(--brand-red)] pl-6">
                {excerpt}
              </p>
            )}
            <div
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:tracking-[-0.02em] prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h3:text-2xl prose-h3:font-semibold prose-a:text-[var(--brand-red)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-l-[var(--brand-red)] prose-blockquote:not-italic prose-blockquote:font-medium"
              dangerouslySetInnerHTML={{
                __html:
                  body ||
                  `<p class="text-[var(--mute)] italic">${
                    locale === "ca"
                      ? "Aquest article encara no té contingut."
                      : locale === "en"
                      ? "This article does not have content yet."
                      : "Este artículo todavía no tiene contenido."
                  }</p>`,
              }}
            />
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-[var(--bone-deep)] py-16 md:py-24 border-t border-[var(--line)]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-[var(--ink)] text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-10">
              {locale === "ca"
                ? "Articles relacionats"
                : locale === "en"
                ? "Related articles"
                : "Artículos relacionados"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((rp) => {
                const rTitle = getPostTitle(rp, locale);
                const rExcerpt = getPostExcerpt(rp, locale);
                return (
                  <Link
                    key={rp.slug}
                    href={{ pathname: "/blog/[slug]", params: { slug: rp.slug } }}
                    className="cursor-grow group block"
                  >
                    <div className="aspect-[16/10] bg-[var(--bone-deep)] overflow-hidden mb-4">
                      {rp.featuredImage && (
                        <img
                          src={rp.featuredImage}
                          alt={rTitle}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      )}
                    </div>
                    <h3 className="font-display text-[var(--ink)] text-lg font-bold leading-tight tracking-[-0.02em] mb-2 group-hover:text-[var(--brand-red)] transition-colors duration-300">
                      {rTitle}
                    </h3>
                    <p className="text-[var(--ink-soft)] text-sm leading-relaxed line-clamp-2">{rExcerpt}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
