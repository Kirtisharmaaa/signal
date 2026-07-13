/**
 * worker/ingest.ts
 *
 * The background process — this is the piece that runs on a schedule
 * (via GitHub Actions, wired up in M6) rather than in response to a request.
 * Run it manually for now: npm run worker
 *
 * M0: reads the source config and the DB connection status, does nothing
 * else yet. M1 adds real fetching. M2 adds real synthesis.
 * new after m1
 * 
 * worker/ingest.ts
 * The background process — proves fetching + saving work end to end (M1).

 */
import sourcesConfig from "../sources.config.json";
import { synthesizeDigest, type RawItem } from "../lib/agent";
import { pingDb, saveItems } from "../lib/db";
import { fetchPageAsItem } from "../lib/fetchPage";

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

// Skip Reddit sources — registration blocked, see decisions.md.
    const fetchableSources = domain.sources.filter((s) => s.type !== "reddit");

    for (const source of fetchableSources) {
      console.log(`Fetching ${source.name}...`);
      try {
        const item = await fetchPageAsItem(source.url, domainKey, source.name);
        const result = await saveItems([item]);
        console.log(`  -> saved ${result.inserted} new (0 means unchanged since last run)`);
      } catch (err) {
        console.error(`  -> failed: ${err instanceof Error ? err.message : err}`);
        if (err instanceof Error && err.cause) console.error(`     cause: ${err.cause}`);
      }
    }

    const skippedReddit = domain.sources.length - fetchableSources.length;
    if (skippedReddit > 0) {
      console.log(`(${skippedReddit} Reddit source(s) skipped — see decisions.md)`);
    }


    const fakeItems: RawItem[] = [];
    const digest = await synthesizeDigest(domainKey, fakeItems);
    console.log(`Digest stub: ${digest.summary}`);
  }

  console.log("\n=== Signal worker — run complete ===");
}

main().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});