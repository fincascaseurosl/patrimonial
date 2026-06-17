import { NextRequest, NextResponse } from "next/server";
import { getQueue, saveQueue } from "@/lib/blog/queue";
import { getCategories } from "@/lib/categories";
import { rewriteArticle, ClaudeError } from "@/lib/blog/claude";
import { requireAdmin } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const queue = await getQueue();
  const idx = queue.findIndex((q) => q.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Item no encontrado" }, { status: 404 });
  }

  const item = queue[idx];
  queue[idx] = { ...item, status: "rewriting", errorMessage: null };
  await saveQueue(queue);

  try {
    const categories = await getCategories();
    const result = await rewriteArticle({
      sourceTitle: item.sourceTitle,
      sourceExcerpt: item.sourceExcerpt,
      sourceContent: item.sourceContent,
      sourceUrl: item.sourceUrl,
      categories: categories.map((c) => ({
        slug: c.slug,
        nameEs: c.nameEs,
      })),
    });

    // Re-fetch para evitar pisar ediciones concurrentes
    const fresh = await getQueue();
    const freshIdx = fresh.findIndex((q) => q.id === id);
    if (freshIdx === -1) {
      return NextResponse.json({ error: "Item desaparecido" }, { status: 404 });
    }
    fresh[freshIdx] = {
      ...fresh[freshIdx],
      status: "ready",
      errorMessage: null,
      aiSlug: result.slug,
      aiCategorySlug: result.categorySlug,
      aiTitleEs: result.titleEs,
      aiTitleCa: result.titleCa,
      aiTitleEn: result.titleEn,
      aiExcerptEs: result.excerptEs,
      aiExcerptCa: result.excerptCa,
      aiExcerptEn: result.excerptEn,
      aiBodyEs: result.bodyEs,
      aiBodyCa: result.bodyCa,
      aiBodyEn: result.bodyEn,
      aiMetaTitleEs: result.metaTitleEs,
      aiMetaTitleCa: result.metaTitleCa,
      aiMetaTitleEn: result.metaTitleEn,
      aiMetaDescriptionEs: result.metaDescriptionEs,
      aiMetaDescriptionCa: result.metaDescriptionCa,
      aiMetaDescriptionEn: result.metaDescriptionEn,
      aiModel: result.model,
      aiTokensIn: result.tokensIn,
      aiTokensOut: result.tokensOut,
      rewrittenAt: new Date().toISOString(),
    };
    await saveQueue(fresh);
    return NextResponse.json(fresh[freshIdx]);
  } catch (e) {
    const msg =
      e instanceof ClaudeError
        ? e.message
        : e instanceof Error
        ? e.message
        : "Error desconocido";

    const fresh = await getQueue();
    const freshIdx = fresh.findIndex((q) => q.id === id);
    if (freshIdx !== -1) {
      fresh[freshIdx] = {
        ...fresh[freshIdx],
        status: "failed",
        errorMessage: msg,
      };
      await saveQueue(fresh);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
