/**
 * worker/ingest.ts
 * M1: fetches real pages and saves raw HTML to Postgres.
 * M2: passes fetched items to Claude, saves the resulting digest.
 * M3: fetches past digests as memory context, generates and stores embeddings.
 */
import sourcesConfig from "../sources.config.json";
import { synthesizeDigest, generateEmbedding } from "../lib/agent";
import { pingDb, saveItems, saveDigest, getRecentDigests } from "../lib/db";
import { fetchPageAsItem, type FetchedItem } from "../lib/fetchPage";

async function main() {
  console.log("=== Signal worker — starting ingestion run ===");
  console.log(`Time: ${new Date().toISOString()}`);

  const db = await pingDb();
  console.log(`DB check: ${db.ok ? "OK" : "NOT CONFIGURED YET"} — ${db.message}`);
  if (!db.ok) return;

  const activeDomains = Object.entries(sourcesConfig.domains).filter(
    ([, domain]) => domain.active
  );

  for (const [domainKey, domain] of activeDomains) {
    console.log(`\n--- Domain: ${domain.label} (${domainKey}) ---`);

    const fetchableSources = domain.sources.filter((s) => s.type !== "reddit");
    const collectedItems: FetchedItem[] = [];

    for (const source of fetchableSources) {
      console.log(`Fetching ${source.name}...`);
      try {
        const item = await fetchPageAsItem(source.url, domainKey, source.name);
        const result = await saveItems([item]);
        console.log(`  -> saved ${result.inserted} new (0 means unchanged since last run)`);
        collectedItems.push(item);
      } catch (err) {
        console.error(`  -> failed: ${err instanceof Error ? err.message : err}`);
        if (err instanceof Error && err.cause) console.error(`     cause: ${err.cause}`);
      }
    }

    const skippedReddit = domain.sources.length - fetchableSources.length;
    if (skippedReddit > 0) {
      console.log(`(${skippedReddit} Reddit source(s) skipped — see decisions.md)`);
    }

    // M3: load past digests so Claude doesn't repeat itself
    const recentDigests = await getRecentDigests(domainKey, 3);
    const recentSummaries = recentDigests.map((d) => d.summary);
    if (recentSummaries.length > 0) {
      console.log(`Memory: found ${recentSummaries.length} past digest(s) to pass as context`);
    }

    console.log(`Synthesizing digest from ${collectedItems.length} item(s)...`);
    const digest = await synthesizeDigest(domainKey, collectedItems, recentSummaries);

    // M3: generate embedding for this digest and save it
    console.log("Generating embedding...");
    const embedding = await generateEmbedding(digest.summary);
    await saveDigest(digest, embedding);

    console.log(`Digest saved (embedding: ${embedding.length} dimensions). Summary:\n${digest.summary}`);
  }

  console.log("\n=== Signal worker — run complete ===");
}

main().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});