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

    // M1 test: just the first source, to prove the pipeline before scaling up.
    const testSource = domain.sources[0];
    console.log(`Fetching ${testSource.name} (test source only)...`);

    try {
      const item = await fetchPageAsItem(testSource.url, domainKey, testSource.name);
      const result = await saveItems([item]);
      console.log(`  -> saved ${result.inserted} new (0 means unchanged since last run)`);
    } catch (err) {
      console.error(`  -> failed: ${err instanceof Error ? err.message : err}`);
      if (err instanceof Error && err.cause) console.error(`     cause: ${err.cause}`);
    }

    const remaining = domain.sources.length - 1;
    console.log(`(${remaining} other source(s) not yet enabled — one at a time)`);

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