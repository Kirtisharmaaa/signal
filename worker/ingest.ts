/**
 * worker/ingest.ts
 *
 * The background process — this is the piece that runs on a schedule
 * (via GitHub Actions, wired up in M6) rather than in response to a request.
 * Run it manually for now: npm run worker
 *
 * M0: reads the source config and the DB connection status, does nothing
 * else yet. M1 adds real fetching. M2 adds real synthesis.
 */

import sourcesConfig from "../sources.config.json";
import { synthesizeDigest, type RawItem } from "../lib/agent";
import { pingDb } from "../lib/db";

async function main() {
  console.log("=== Signal worker — starting ingestion run ===");
  console.log(`Time: ${new Date().toISOString()}`);

  const db = await pingDb();
  console.log(`DB check: ${db.ok ? "OK" : "NOT CONFIGURED YET"} — ${db.message}`);

  const activeDomains = Object.entries(sourcesConfig.domains).filter(
    ([, domain]) => domain.active
  );

  if (activeDomains.length === 0) {
    console.log("No active domains in sources.config.json. Nothing to do.");
    return;
  }

  for (const [domainKey, domain] of activeDomains) {
    console.log(`\n--- Domain: ${domain.label} (${domainKey}) ---`);
    console.log(`Would fetch ${domain.sources.length} source(s):`);
    for (const source of domain.sources) {
      console.log(`  - [${source.type}] ${source.name} (${source.url})`);
    }

    // M0 stub: no real fetching yet, so we fake zero items and still
    // exercise the synthesize step to prove the pipeline shape.
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
