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
