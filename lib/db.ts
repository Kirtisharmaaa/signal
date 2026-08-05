/**
 * lib/db.ts
 *
 * Shared Supabase (Postgres + pgvector) client — used by both the worker
 * and the Next.js app. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
 * as environment variables once you've created a Supabase project.
 *
 * M0: connection check only, no tables yet.
 * M1 adds the raw_items table. M2 adds digests. M3 adds embeddings.
 */
import type { Digest } from "./agent";
import type { FetchedItem } from "./fetchPage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getDb() {
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local (app) " +
        "or as GitHub Actions secrets (worker) once your Supabase project exists."
    );
  }
  return createClient(url, key);
}

/**
 * Simple connectivity check for M0 — confirms env vars are set and the
 * client can be constructed. Doesn't require any tables to exist yet.
 */
export async function pingDb(): Promise<{ ok: boolean; message: string }> {
  try {
    getDb();
    return { ok: true, message: "Supabase client created successfully. Env vars are set." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function saveItems(items: FetchedItem[]): Promise<{ inserted: number }> {
  if (items.length === 0) return { inserted: 0 };

  const db = getDb();
  const { data, error } = await db
    .from("raw_items")
    .upsert(items, { onConflict: "source_name,content_hash", ignoreDuplicates: true })
    .select();

  if (error) throw new Error(`Failed to save items: ${error.message}`);

  return { inserted: data?.length ?? 0 };
}
export async function saveDigest(digest: Digest, embedding?: number[]): Promise<void> {
  const db = getDb();
  const { error } = await db.from("digests").insert({
    domain: digest.domain,
    summary: digest.summary,
    item_count: digest.itemCount,
    generated_at: digest.generatedAt,
    ...(embedding ? { embedding: JSON.stringify(embedding) } : {}),
  });

  if (error) throw new Error(`Failed to save digest: ${error.message}`);
}

export async function getRecentDigests(
  domain: string,
  limit: number = 3
): Promise<{ summary: string }[]> {
  const db = getDb();
  const { data, error } = await db
    .from("digests")
    .select("summary")
    .eq("domain", domain)
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch recent digests: ${error.message}`);
  return data ?? [];
}
export async function findSimilarDigests(
  embedding: number[],
  limit: number = 5,
  threshold: number = 0.3
): Promise<{ id: number; domain: string; summary: string; generated_at: string; similarity: number }[]> {
  const db = getDb();
  const { data, error } = await db.rpc("match_digests", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) throw new Error(`Vector search failed: ${error.message}`);
  return data ?? [];
}
export async function getDigests(limit: number = 20): Promise<{
  id: number;
  domain: string;
  summary: string;
  item_count: number;
  generated_at: string;
  saved: boolean;
}[]> {
  const db = getDb();
  const { data, error } = await db
    .from("digests")
    .select("id, domain, summary, item_count, generated_at, saved")
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch digests: ${error.message}`);
  return data ?? [];
}
export async function getDigestById(id: number): Promise<{
  id: number;
  domain: string;
  summary: string;
  item_count: number;
  generated_at: string;
  embedding: number[] | null;
  feedback: boolean | null;
} | null> {
  const db = getDb();
  const { data, error } = await db
    .from("digests")
    .select("id, domain, summary, item_count, generated_at, embedding, feedback")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
export async function getDigestsByDateRange(
  range: "7d" | "30d" | "90d" | "1yr",
  topic?: string
): Promise<{ id: number; domain: string; summary: string; item_count: number; generated_at: string }[]> {
  const days = { "7d": 7, "30d": 30, "90d": 90, "1yr": 365 }[range];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const db = getDb();
  let query = db
    .from("digests")
    .select("id, domain, summary, item_count, generated_at")
    .gte("generated_at", since)
    .order("generated_at", { ascending: false });

  if (topic) {
    query = query.ilike("summary", `%${topic}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch digests: ${error.message}`);
  return data ?? [];
}