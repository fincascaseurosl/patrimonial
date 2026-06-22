import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { getPublicPosts, getPostTitle, getPostExcerpt } from "@/lib/posts";
import { getCategories, getCategoryName } from "@/lib/categories";
import { ogMeta } from "@/lib/site-config";
import type { Post } from "@/lib/posts";
import type { Category } from "@/lib/categories";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const description =
    locale === "ca"
      ? "Consells i novetats sobre construcció, reformes i rehabilitació a Barcelona."
      : locale === "en"
      ? "Advice and updates on construction, renovations and building refurbishment in Barcelona."
      : "Consejos y novedades sobre construcción, reformas y rehabilitación en Barcelona.";
  return {
    title: "Blog",
    description,
    openGraph: ogMeta(locale, "Blog", description),
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        es: "/es/blog",
        ca: "/ca/blog",
        en: "/en/blog",
        "x-default": "/es/blog",
      },
    },
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);

  const [allPosts, categories] = await Promise.all([getPublicPosts(), getCategories()]);

  const filtered = cat ? allPosts.filter((p) => p.categorySlug === cat) : allPosts;
  const activeCategory = cat ? categories.find((c) => c.slug === cat) : null;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[var(--color-dark)] text-white pt-32 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[var(--color-primary)] text-[12px] font-semibold tracking-[0.3em] uppercase mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.02em] mb-4">
            {activeCategory
              ? getCategoryName(activeCategory, locale)
              : locale === "ca"
              ? "Articles del blog"
              : locale === "en"
              ? "Blog articles"
              : "Artículos del blog"}
          </h1>
          <div className="w-12 h-[2px] bg-[var(--color-primary)] mt-2" />
        </div>
      </section>

      {/* Category filters */}
      {categories.length > 0 && (
        <section className="border-b border-[var(--line)] bg-[var(--paper)] sticky top-0 z-20 backdrop-blur-md bg-[var(--paper)]/90">
          <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
            <CategoryTab href="/blog" active={!cat} count={allPosts.length}>
              {locale === "ca" ? "Tots" : locale === "en" ? "All" : "Todos"}
            </CategoryTab>
            {categories.map((c) => {
              const count = allPosts.filter((p) => p.categorySlug === c.slug).length;
              if (count === 0) return null;
              return (
                <CategoryTab key={c.slug} href={`/blog?cat=${c.slug}`} active={cat === c.slug} count={count}>
                  {getCategoryName(c, locale)}
                </CategoryTab>
              );
            })}
          </div>
        </section>
      )}

      {/* Posts grid */}
      <section className="py-20 md:py-28 bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[var(--ink-soft)]">
              <p className="text-lg font-medium">
                {locale === "ca"
                  ? "Encara no hi ha articles"
                  : locale === "en"
                  ? "No articles yet"
                  : "Aún no hay artículos"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filtered.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} categories={categories} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function CategoryTab({ href, active, count, children }: {
  href: string;
  active: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href as never}
      className={`px-4 py-4 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
        active
          ? "text-[var(--brand-red)] border-[var(--brand-red)]"
          : "text-[var(--ink-soft)] border-transparent hover:text-[var(--ink)]"
      }`}
    >
      {children}
      <span className={`text-[10px] tabular-nums ${active ? "text-[var(--brand-red)]" : "text-[var(--mute)]"}`}>
        {count}
      </span>
    </Link>
  );
}

function PostCard({ post, locale, categories }: {
  post: Post;
  locale: string;
  categories: Category[];
}) {
  const title = getPostTitle(post, locale);
  const excerpt = getPostExcerpt(post, locale);
  const category = categories.find((c) => c.slug === post.categorySlug);
  const dateLocale = locale === "ca" ? "ca-ES" : locale === "en" ? "en-GB" : "es-ES";
  const date = new Date(post.publishedAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
      className="cursor-grow group block"
    >
      <div className="relative aspect-[16/10] bg-[var(--bone-deep)] overflow-hidden mb-5">
        {post.featuredImage && (
          <Image
            src={post.featuredImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="flex items-center gap-3 mb-3">
        {category && (
          <span className="text-[var(--brand-red)] text-[10px] font-semibold tracking-[0.2em] uppercase">
            {getCategoryName(category, locale)}
          </span>
        )}
        <span className="text-[10px] text-[var(--mute)] tracking-wider uppercase">{date}</span>
      </div>
      <h2 className="font-display text-[var(--ink)] text-xl md:text-2xl font-bold leading-tight tracking-[-0.02em] mb-3 group-hover:text-[var(--brand-red)] transition-colors duration-300">
        {title}
      </h2>
      <p className="text-[var(--ink-soft)] text-sm leading-relaxed line-clamp-3">{excerpt}</p>
    </Link>
  );
}
