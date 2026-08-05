/**
 * lib/agent.ts
 * M2: synthesizeDigest() makes a real Claude API call.
 * M3: generateEmbedding() turns digest text into a vector. synthesizeDigest()
 *     accepts past digests as context so Claude avoids repeating itself.
 * M4 wires up answerQuestion() for real.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { FetchedItem } from "./fetchPage";

export interface Digest {
  domain: string;
  summary: string;
  itemCount: number;
  generatedAt: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * M3: converts text into a 1024-number vector using Voyage AI.
 * Similar text → similar vectors. Used to detect repeated content.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("Missing VOYAGE_API_KEY — add it to .env.local");

  const response = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: [text], model: "voyage-3" }),
  });

  if (!response.ok) {
    throw new Error(`Voyage API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { data: { embedding: number[] }[] };
  return data.data[0].embedding;
}

/**
 * M2+M3: synthesizes a digest from fetched pages.
 * recentDigests — summaries of past digests for this domain, so Claude
 * knows what it already covered and won't repeat it.
 */
export async function synthesizeDigest(
  domain: string,
  items: FetchedItem[],
  recentDigests: string[] = []
): Promise<Digest> {
  if (items.length === 0) {
    return {
      domain,
      summary: "No items fetched for this run.",
      itemCount: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY — add it to .env.local");

  const client = new Anthropic({ apiKey });

  const sourceTexts = items
    .map((item) => {
      const text = stripHtml(item.raw_html).slice(0, 5000);
      return `--- ${item.source_name} (${item.url}) ---\n${text}`;
    })
    .join("\n\n");

  const memorySection = recentDigests.length > 0
    ? `\nYou have already reported the following — do not repeat these:\n${recentDigests.map((d, i) => `[${i + 1}] ${d}`).join("\n")}\n`
    : "";

  const prompt = `You are a product intelligence analyst. Below are pages from tools in the "${domain}" space.
Read them and write a concise digest (3-5 bullet points) of the most notable product updates, new features, or changes.
Focus only on what actually shipped — ignore marketing copy, pricing pages, and general descriptions.
${memorySection}
${sourceTexts}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = message.content[0].type === "text" ? message.content[0].text : "";

  return {
    domain,
    summary,
    itemCount: items.length,
    generatedAt: new Date().toISOString(),
  };
}

export interface Insight {
  headline: string;
  signalCount: number;
  topic: string;
  domains: string[];
}

/**
 * Synthesizes 3 cross-domain insights from recent digests.
 * Unlike synthesizeDigest() which summarizes one domain, this reads across
 * all domains and identifies patterns, trends, and cross-product conclusions.
 */
export async function synthesizeInsights(
  digests: { domain: string; summary: string; item_count: number; generated_at: string }[]
): Promise<Insight[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const client = new Anthropic({ apiKey });

  const context = digests
    .map((d) => `[${d.domain} — ${new Date(d.generated_at).toDateString()} — ${d.item_count} signals]\n${d.summary}`)
    .join("\n\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a product intelligence analyst tracking page builders, app builders, and form builders.

Below are recent digest summaries from multiple domains. Identify the 3 most important cross-domain insights — patterns, trends, or developments that a PM or founder should know about this week. Prioritize findings that span multiple products or domains over single-product updates.

For each insight write:
- A 1-2 sentence headline capturing the key finding
- Which domains it applies to
- A short topic keyword (1-3 words, e.g. "MCP adoption", "AI pricing", "mobile builders")
- An estimated signal count supporting it

Return ONLY a JSON array, no other text:
[
  { "headline": "...", "domains": ["..."], "topic": "...", "signalCount": N },
  { "headline": "...", "domains": ["..."], "topic": "...", "signalCount": N },
  { "headline": "...", "domains": ["..."], "topic": "...", "signalCount": N }
]

Digests:
${context}`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";

  try {
    const parsed = JSON.parse(text.trim());
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

/**
 * M4: answers a question using relevant past digests as context.
 * The caller (API route) is responsible for fetching the relevant digests
 * via vector search — this function just handles the Claude call.
 */
export async function answerQuestion(
  question: string,
  relevantDigests: { domain: string; summary: string; generated_at: string; similarity: number }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const client = new Anthropic({ apiKey });

  const context = relevantDigests.length > 0
    ? relevantDigests
        .map((d) => `[${d.domain} — ${new Date(d.generated_at).toDateString()} — similarity: ${(d.similarity * 100).toFixed(0)}%]\n${d.summary}`)
        .join("\n\n")
    : "No relevant past digests found in the database.";

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a product intelligence assistant tracking page builders, form builders, and app builders.
Answer the user's question based on the digest summaries below.
If the answer isn't covered in the digests, say so honestly — don't make things up.
Cite which tool and approximate date when referencing specific updates.

Relevant digests:
${context}

User question: ${question}`,
    }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}