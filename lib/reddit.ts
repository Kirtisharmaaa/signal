import { createHash } from "crypto";

export interface FetchedItem {
  domain: string;
  source_name: string;
  url: string;
  title: string;
  content_hash: string;
}

export async function fetchRedditItems(
  subredditUrl: string,
  domain: string,
  sourceName: string
): Promise<FetchedItem[]> {
  const jsonUrl = subredditUrl.replace(/\/?$/, "") + "/new.json?limit=10";

  const response = await fetch(jsonUrl, {
    headers: { "User-Agent": "signal-app/0.1 (personal project)" },
  });

  if (!response.ok) {
    throw new Error(`Reddit fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const posts = data.data.children as { data: { title: string; permalink: string } }[];

  return posts.map((post) => {
    const title = post.data.title;
    const url = "https://www.reddit.com" + post.data.permalink;
    const contentHash = createHash("sha256").update(title + url).digest("hex");

    return { domain, source_name: sourceName, url, title, content_hash: contentHash };
  });
}