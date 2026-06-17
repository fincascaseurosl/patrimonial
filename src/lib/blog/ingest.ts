import { fetchFeed, htmlToText, type RssItem } from "./rss";
import {
  getSources,
  saveSources,
  type BlogSource,
} from "./sources";
import {
  getQueue,
  saveQueue,
  generateQueueId,
  emptyDraft,
  type QueueItem,
} from "./queue";

export interface IngestSummary {
  sourceId: string;
  sourceName: string;
  totalInFeed: number;
  inserted: number;
  duplicated: number;
  error?: string;
}

export interface IngestRunResult {
  totalInserted: number;
  totalSources: number;
  perSource: IngestSummary[];
}

async function ingestSourceInto(
  source: BlogSource,
  queue: QueueItem[],
  existingUrls: Set<string>,
): Promise<{ summary: IngestSummary; newQueue: QueueItem[]; updatedSource: BlogSource }> {
  let items: RssItem[] = [];
  let error: string | undefined;

  try {
    items = await fetchFeed(source.feedUrl);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return {
      summary: {
        sourceId: source.id,
        sourceName: source.name,
        totalInFeed: 0,
        inserted: 0,
        duplicated: 0,
        error,
      },
      newQueue: queue,
      updatedSource: {
        ...source,
        lastError: error,
        lastFetchedAt: new Date().toISOString(),
      },
    };
  }

  let inserted = 0;
  let duplicated = 0;
  const additions: QueueItem[] = [];

  for (const item of items) {
    if (!item.link || !item.title) continue;
    if (existingUrls.has(item.link)) {
      duplicated++;
      continue;
    }

    const sourceContent = item.content ? htmlToText(item.content) : null;
    const sourceExcerpt = item.description ? htmlToText(item.description) : null;

    additions.push({
      id: generateQueueId(),
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: item.link,
      sourceTitle: item.title,
      sourceExcerpt,
      sourceContent,
      sourceImage: item.image || null,
      sourcePublishedAt: item.pubDate || null,
      ingestedAt: new Date().toISOString(),
      status: "pending",
      errorMessage: null,
      ...emptyDraft(),
    });
    existingUrls.add(item.link);
    inserted++;
  }

  return {
    summary: {
      sourceId: source.id,
      sourceName: source.name,
      totalInFeed: items.length,
      inserted,
      duplicated,
    },
    newQueue: [...queue, ...additions],
    updatedSource: {
      ...source,
      lastError: null,
      lastFetchedAt: new Date().toISOString(),
      totalImported: source.totalImported + inserted,
    },
  };
}

export async function ingestAllActiveSources(): Promise<IngestRunResult> {
  const sources = await getSources();
  const active = sources.filter((s) => s.isActive);
  if (active.length === 0) {
    return { totalInserted: 0, totalSources: 0, perSource: [] };
  }

  let queue = await getQueue();
  const existingUrls = new Set(queue.map((q) => q.sourceUrl));
  const updatedSources = [...sources];
  const summaries: IngestSummary[] = [];

  for (const source of active) {
    const result = await ingestSourceInto(source, queue, existingUrls);
    queue = result.newQueue;
    const idx = updatedSources.findIndex((s) => s.id === source.id);
    if (idx !== -1) updatedSources[idx] = result.updatedSource;
    summaries.push(result.summary);
  }

  await saveQueue(queue);
  await saveSources(updatedSources);

  return {
    totalInserted: summaries.reduce((acc, s) => acc + s.inserted, 0),
    totalSources: active.length,
    perSource: summaries,
  };
}

export async function ingestOneSource(sourceId: string): Promise<IngestSummary> {
  const sources = await getSources();
  const source = sources.find((s) => s.id === sourceId);
  if (!source) {
    return {
      sourceId,
      sourceName: "(desconocida)",
      totalInFeed: 0,
      inserted: 0,
      duplicated: 0,
      error: "Fuente no encontrada",
    };
  }

  const queue = await getQueue();
  const existingUrls = new Set(queue.map((q) => q.sourceUrl));
  const result = await ingestSourceInto(source, queue, existingUrls);

  await saveQueue(result.newQueue);
  const updatedSources = sources.map((s) =>
    s.id === source.id ? result.updatedSource : s,
  );
  await saveSources(updatedSources);

  return result.summary;
}
