import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

const blogPosts = [
  {
    slug: "como-detectar-amianto-en-viviendas",
    date: "2018-01-15",
    image: "/images/blog/amianto.jpg",
  },
  {
    slug: "reformas-integrales-barcelona-guia",
    date: "2018-03-20",
    image: "/images/blog/reformas.jpg",
  },
];

const postTitles: Record<string, { es: string; ca: string }> = {
  "como-detectar-amianto-en-viviendas": {
    es: "Cómo detectar amianto en viviendas",
    ca: "Com detectar amiant a habitatges",
  },
  "reformas-integrales-barcelona-guia": {
    es: "Guía de reformas integrales en Barcelona",
    ca: "Guia de reformes integrals a Barcelona",
  },
};

const postExcerpts: Record<string, { es: string; ca: string }> = {
  "como-detectar-amianto-en-viviendas": {
    es: "Si tu vivienda fue construida antes de 2002, es posible que contenga materiales con amianto. Te explicamos cómo detectarlo y qué hacer.",
    ca: "Si el teu habitatge va ser construït abans del 2002, és possible que contingui materials amb amiant. T'expliquem com detectar-lo i què fer.",
  },
  "reformas-integrales-barcelona-guia": {
    es: "Todo lo que necesitas saber antes de hacer una reforma integral: permisos, plazos, presupuesto y cómo elegir la empresa adecuada.",
    ca: "Tot el que necessites saber abans de fer una reforma integral: permisos, terminis, pressupost i com triar l'empresa adequada.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ca" ? "Blog" : "Blog",
    description:
      locale === "ca"
        ? "Consells i novetats sobre construcció, reformes i rehabilitació a Barcelona."
        : "Consejos y novedades sobre construcción, reformas y rehabilitación en Barcelona.",
    alternates: {
      languages: {
        es: "/es/blog",
        ca: "/ca/blog",
      },
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="relative bg-[var(--color-dark)] text-white pt-32 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[var(--color-primary)] text-[12px] font-semibold tracking-[0.3em] uppercase mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.02em] mb-4">Blog</h1>
          <div className="w-12 h-[2px] bg-[var(--color-primary)] mt-2" />
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => {
              const title =
                postTitles[post.slug]?.[locale as "es" | "ca"] ||
                post.slug;
              const excerpt =
                postExcerpts[post.slug]?.[locale as "es" | "ca"] || "";

              return (
                <article
                  key={post.slug}
                  className="group bg-white overflow-hidden"
                >
                  <div className="aspect-[16/9] bg-[var(--color-gray-light)] overflow-hidden">
                    <img
                      src={post.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-6">
                    <time className="text-[11px] text-[var(--color-text-muted)] tracking-wider uppercase">{post.date}</time>
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mt-2 mb-3 tracking-[-0.01em]">
                      {title}
                    </h2>
                    <p className="text-[var(--color-text-light)] text-sm leading-relaxed">
                      {excerpt}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
