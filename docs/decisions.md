# Architecture decisions log
Kept short and dated — one entry per real decision, not a diary.

## 2026-07-03 — M0 scaffolded
Stack: Next.js (TypeScript only, no Python) + Supabase (Postgres/pgvector) + GitHub Actions worker.
Frontend and backend combined into one Next.js app — the request/response concept doesn't need two separate deployed services to be visible.
Worker kept separate from the app — this is the one split that teaches something the app alone can't: a process that runs on its own schedule vs. one that waits for a request.
Dropped `next/font/google` in favor of a system font stack — the sandbox used to build this couldn't reach Google Fonts, and removing the dependency entirely is simpler anyway (no build-time network call).
Domains: page/screen builders (active first), form builders and app builders added later once the pipeline is proven on one domain.

## 2026-07-03 — M1: raw ingestion
`fetchPage.ts` kept separate from `lib/agent.ts` and `lib/db.ts` — fetching is a pure I/O concern, not AI logic or persistence logic. Each file has one job.
Content hashing (`sha256` of raw HTML) used for idempotency — upsert on `(source_name, content_hash)` means re-running the worker on unchanged pages is a no-op.
Reddit sources skipped — Reddit rate-limits unauthenticated requests and requires OAuth for reliable access. Not worth the dependency for now.

## 2026-07-03 — M2: real synthesis
Switched from Gemini (free tier) to Anthropic `claude-haiku-4-5-20251001` — Gemini hit org-policy quota blocks on a Zoho work account. Haiku is fast and cheap enough for both scheduled synthesis and on-demand chat.
`stripHtml()` strips `<script>` and `<style>` block contents before removing tags — early version only stripped tags, leaving raw JavaScript in the text sent to Claude.

## 2026-07-03 — M3: embeddings + memory
Voyage AI `voyage-3` (1024 dims) chosen over OpenAI embeddings — keeps LLM calls (Anthropic) and embedding calls (Voyage) as separate vendor concerns, each independently swappable. Voyage has a generous free tier.
Recent digests passed to Claude as context ("you already reported these — don't repeat") — without this, every run produced near-identical summaries.

## 2026-07-03 — M4: chat
`answerQuestion()` takes pre-fetched digests as a parameter rather than fetching them itself — the API route acts as orchestrator, keeping agent.ts and db.ts from importing each other (circular dependency).
`match_digests` Postgres function used for vector search — Supabase JS client doesn't expose raw `<=>` cosine distance operators, so the query lives in a DB function called via `.rpc()`.
Similarity threshold set to 0.3 — 0.5 returned no results in early testing; 0.3 is loose enough to find relevant context without pulling in noise.

## 2026-07-03 — M5: dashboard
`app/page.tsx` is a Server Component that queries Supabase directly — no need for an API route when the data fetch happens at render time on the server.
`Chat.tsx` extracted as a Client Component (`"use client"`) — chat needs `useState` for message history, which Server Components don't support. The split keeps the interactive part isolated.

## 2026-07-24 — M6: GitHub Actions
Node 22 pinned in the workflow — Supabase JS client v2+ requires native WebSocket support, absent in Node 20. Node 20 caused silent DB connection failures with no useful error.
Worker invoked as `npx tsx worker/ingest.ts` directly — earlier `npm run worker` used `--env-file=.env.local` which doesn't exist on GitHub's runners.

## 2026-08-04 — UI: react-markdown for digest rendering
Replaced all string-splitting (`cleanSummary`, `parseSummary`, `BulletList`) with `react-markdown` + `remark-gfm`. Root cause of every formatting issue: digests are stored as markdown but we were stripping it instead of rendering it. `DigestSummary` component in `app/components/digest-summary.tsx` is now the single renderer used across home page, investigation view, and detail page. Investigation page widened to `max-w-4xl`; digest cards use `<article>` with "Open digest →" link instead of wrapping the whole content in a `<Link>`.

## 2026-08-04 — UI M5: History view
`chat_history` table added to Supabase — stores question, answer, range, and created_at per Ask Signal query.
`saveChatHistory()`, `getChatHistory()`, `getSavedDigests()` added to `lib/db.ts`. Chat API route now calls `saveChatHistory()` after every successful answer.
History page at `app/history/page.tsx` — two sections: Saved Insights (digests with `saved = true`) and Past Questions (chat_history entries, most recent first, answer truncated to 300 chars).
Products and History nav links added to home page header.

## 2026-08-04 — UI M4-M5: Product Profiles
`lib/products.ts` added as single source of truth for tracked products — name, slug, domain, and search keyword. Slug is URL-safe (e.g. "bolt-new"), keyword is what gets searched in digest summaries (e.g. "Bolt"). Kept separate from `sources.config.json` — that file drives the worker, this drives the UI.
`getDigestsByKeyword()` added to `lib/db.ts` — searches all digests by keyword with no date filter. Reuses `.ilike` pattern from `getDigestsByDateRange`.
Product listing at `app/products/page.tsx`, individual profiles at `app/product/[name]/page.tsx`. Profiles show digest count, recent mentions, links to investigation view and Ask Signal.
Built with 8 days of data rather than the planned 60 — structure is correct, depth will improve as data accumulates. "View product profiles →" link added to home page after signal count strip.

## 2026-08-04 — UI M4 part 2: Save Insight
Star button added to each insight card on the home page — toggles `saved` boolean on the `digests` table in Supabase. `☆ Save` / `★ Saved` visual state managed in `SaveButton` Client Component. API route at `app/api/save/route.ts` follows same pattern as feedback route.
`getDigests()` updated to select `saved` column. Purpose: bookmarked digests are the data layer for the History view in M5.

## 2026-08-04 — UI M4 part 1: Ask Signal time-range support
Time range selector added to `chat.tsx` — four options (All time, Last 7 days, Last 30 days, Last 90 days), stored in component state, passed in POST body alongside the message.
Chat API route updated to branch on range: if range is set and not "all", uses `getDigestsByDateRange` instead of vector search — date context matters more than semantic similarity for time-scoped questions. If "all", keeps existing embedding + `findSimilarDigests` flow.
`similarity: 1` passed as placeholder for date-ranged digests — `answerQuestion` expects that field; no semantic score exists for date-filtered results so 1 (fully relevant) is used to keep the shape consistent without changing `agent.ts`.
ANTHROPIC_API_KEY was invalid in `.env.local`, Vercel, and GitHub Actions — regenerated and updated in all three places.

## 2026-08-04 — UI M3: investigation view + trending topic pages
Time-based investigation view added at `app/investigate/page.tsx` — reads `topic`, `label`, and `range` from URL search params. Filters digests by date range using `.gte` on `generated_at` and `.ilike` on summary for keyword search.
`getDigestsByDateRange(range, topic?)` added to `lib/db.ts` — calculates start date from range string (7d/30d/90d/1yr), queries Supabase with optional case-insensitive keyword filter.
Trending topic chips on home page changed from dead buttons to `<Link>` components. Each chip passes two URL params: `keyword` (short search term like "AI") and `label` (display name like "AI Generation") — split because `.ilike` needs short terms to match real digest text, but the heading should show the friendly label.
`label` param preserved when switching time ranges so the heading stays correct across navigation.
In Next.js 16, `searchParams` is a Promise and must be awaited — same pattern as `params` in dynamic routes.

## 2026-08-04 — UI M2: signal detail view + feedback
Signal detail view added at `app/digest/[id]/page.tsx` — dynamic Next.js route showing full summary, "Why it matters" placeholder, and related signals via existing vector search (`findSimilarDigests`).
`params` must be awaited in Next.js 16 before reading `.id` — `{ params: Promise<{ id: string }> }` — caught as a 404 in testing.
`getDigestById` added to `lib/db.ts` — fetches single digest by id including embedding and feedback columns.
Thumbs up/down feedback added to detail page via `FeedbackButtons` Client Component — stores `boolean | null` in new `feedback` column on `digests` table. `NULL` = no feedback, `true` = up, `false` = down. Purpose: evidence base for M7 tuning — without real feedback, quality improvements are guesswork.
Feedback API route at `app/api/feedback/route.ts` — POST endpoint, validates id (number) and value (boolean), writes to Supabase.
Explore button on insight cards and product signal items on home page now link to `/digest/[id]`.

## 2026-07-30 — UI rebuild: Weekly Intelligence Brief layout
Replaced two-panel (digest feed + chat sidebar) layout with single-column Weekly Intelligence Brief per signal-ui-plan.md.
Top 3 most recent digests surfaced as placeholder "insight" cards — real cross-domain synthesis (a new `synthesizeInsights()` function) not yet built; this gives the layout real content to test against until then.
Signal count strip (total + per-domain breakdown) derived from `item_count` fields across all fetched digests.
Trending Topics rendered as hardcoded chips — real topic extraction planned for M3 investigation view.
Product Signals section groups remaining digests by domain using native `<details>/<summary>` for collapse — avoids converting `page.tsx` to a Client Component just for toggle state.
Ask Signal moved from sidebar to inline bottom section; suggestion chips added to `chat.tsx` — clicking a chip pre-fills the textarea.
Rejected patterns from the plan now enforced: no two-panel layout, no signal count as hero, no fullscreen chat, no sidebar navigation.

## 2026-07-29 — app-builders domain activated
Added Bubble, FlutterFlow, Airtable, Retool, Glide, Lovable, Replit, Bolt.new as sources.
Null bytes stripped from fetched HTML in `fetchPage.ts` — Lovable's blog contained `\u0000` characters that Postgres rejects during insert.