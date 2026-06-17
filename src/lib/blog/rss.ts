export interface RssItem {
  title: string;
  link: string;
  description?: string;
  content?: string;
  pubDate?: string;
  image?: string;
  guid?: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function tagContent(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  if (!m) return undefined;
  let raw = m[1].trim();
  raw = raw.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
  return decodeEntities(raw).trim() || undefined;
}

function extractImage(itemXml: string): string | undefined {
  const enclosure = itemXml.match(
    /<enclosure[^>]*url=['"]([^'"]+)['"][^>]*type=['"]image\/[^'"]+['"]/i,
  );
  if (enclosure) return enclosure[1];

  const media = itemXml.match(
    /<media:(?:content|thumbnail)[^>]*url=['"]([^'"]+)['"]/i,
  );
  if (media) return media[1];

  const img = itemXml.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
  if (img) return img[1];

  return undefined;
}

function parseDate(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function parseFeed(xml: string): RssItem[] {
  const items: RssItem[] = [];

  const itemRe = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  const matches = xml.match(itemRe) || [];

  for (const block of matches) {
    const isAtom = /^<entry\b/i.test(block);

    const title = tagContent(block, "title") || "";
    let link = "";

    if (isAtom) {
      const linkAlt = block.match(
        /<link[^>]*rel=['"]alternate['"][^>]*href=['"]([^'"]+)['"]/i,
      );
      const linkHref =
        linkAlt || block.match(/<link[^>]*href=['"]([^'"]+)['"]/i);
      link = linkHref?.[1] || "";
    } else {
      link = tagContent(block, "link") || "";
    }

    if (!title || !link) continue;

    const description =
      tagContent(block, "description") || tagContent(block, "summary");

    const content =
      tagContent(block, "content:encoded") || tagContent(block, "content");

    const pubDate = parseDate(
      tagContent(block, "pubDate") ||
        tagContent(block, "published") ||
        tagContent(block, "updated") ||
        tagContent(block, "dc:date"),
    );

    const guid = tagContent(block, "guid") || tagContent(block, "id");

    items.push({
      title: title.replace(/<[^>]+>/g, "").trim(),
      link: link.trim(),
      description,
      content,
      pubDate,
      image: extractImage(block),
      guid,
    });
  }

  return items;
}

export async function fetchFeed(feedUrl: string): Promise<RssItem[]> {
  const res = await fetch(feedUrl, {
    headers: {
      "User-Agent": "PatrimonialObras-BlogBot/1.0 (+https://obrasenbarcelona.es)",
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Feed HTTP ${res.status}: ${feedUrl}`);
  }

  const xml = await res.text();
  return parseFeed(xml);
}

export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
