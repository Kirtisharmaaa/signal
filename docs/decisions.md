# Architecture decisions log

Kept short and dated — one entry per real decision, not a diary.

---

**2026-07-03 — M0 scaffolded**
- Stack: Next.js (JS/TS only, no Python) + Supabase (Postgres/pgvector) + GitHub Actions worker.
- Frontend and backend combined into one Next.js app — the request/response
  concept doesn't need two separate deployed services to be visible.
- Worker kept separate from the app — this is the one split that teaches
  something the app alone can't: a process that runs on its own schedule
  vs. one that waits for a request.
- Dropped `next/font/google` in favor of a system font stack — the sandbox
  used to build this couldn't reach Google Fonts, and removing the
  dependency entirely is simpler anyway (no build-time network call).
- Domains: page/screen builders (active first), form builders and app
  builders added later once the pipeline is proven on one domain.

  **2026-07-08 — Fixed worker env loading**
- `dotenv` inside the script loaded too late (imports run before other
  code, so `lib/db.ts` checked for env vars before dotenv set them).
- Fixed with Node's built-in `--env-file` flag in the `worker` script
  instead — loads before the script starts, no timing issue.

  **2026-07-09 — Reddit API registration broken, pivoted to direct blog fetching**
- Reddit's `.json` endpoint (used in initial M1 draft) now blocks all
  unauthenticated requests as of ~May 2026 — a Reddit policy change, not
  a bug in our code.
- Attempted the official free API route (registering a "script" app at
  reddit.com/prefs/apps). The registration page's reCAPTCHA silently
  failed to load across three browsers (Chrome, Brave, Safari) with
  shields/ad-blockers disabled — a broken page on Reddit's end, not our
  environment.
- Pivoted M1's first real source to direct HTML fetching of a single
  blog/changelog page instead. Scoped down: treats the whole page as one
  item, fingerprints the full HTML — not per-post parsing yet. That's
  deferred to a later milestone once this simpler version works.
- Reddit may be revisited later (M6+) if their registration page gets
  fixed, or skipped entirely in favor of GitHub/HN (see build-plan.md
  source roadmap).

  **2026-07-09 — M1 core pipeline proven working**
- Hit a real Node limitation: Webflow's response headers exceeded Node's
  default size limit, causing a cryptic "fetch failed" with a hidden
  `HeadersOverflowError` cause. Fixed by raising the limit via
  `NODE_OPTIONS='--max-http-header-size=100000'` in the worker script.
- Verified end to end: first run saved 1 new row into Supabase's
  `raw_items` table; second run (unchanged page) correctly saved 0 —
  confirming the `unique` constraint prevents duplicates as designed.
- Still only testing 1 of 7 sources (Webflow Updates). Next: enable the
  remaining blog/changelog sources one at a time.

**2026-07-13 — M1 complete: all 5 fetchable sources working**
- Enabled all non-Reddit sources (Webflow Updates, Webflow Blog, Framer
  Updates, Wix Studio Blog, Builder.io Blog) via a loop instead of one
  hardcoded test source.
- All 5 fetched successfully on first try — no further header-size or
  network issues beyond the one already fixed.
- Confirmed change detection works for real: Webflow Updates' content
  changed between July 9 and July 13, and the worker correctly saved a
  new row instead of silently missing it.
- M1 core objective met: real fetch -> dedupe -> store, working across
  multiple real sources, not just one.