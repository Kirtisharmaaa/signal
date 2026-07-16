import { createHash } from "crypto";

export interface FetchedItem {
  domain: string;
  source_name: string;
  url: string;
  title: string;
  content_hash: string;
  raw_html: string;
}

export async function fetchPageAsItem(
  pageUrl: string,
  domain: string,
  sourceName: string
): Promise<FetchedItem> {
  const response = await fetch(pageUrl, {
    headers: { "User-Agent": "signal-app/0.1 (personal learning project)" },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const contentHash = createHash("sha256").update(html).digest("hex");

  return {
    domain,
    source_name: sourceName,
    url: pageUrl,
    title: sourceName,
    content_hash: contentHash,
    raw_html: html,
  };
}