# Signal — Build Plan
### A product-intelligence agent for the form-builder + page/screen-builder space

---

## 1. What we're building

Signal watches a defined set of sources across three adjacent product categories —
**form builders** (Typeform, Tally, Notion Forms, Jotform, Google Forms),
**page/screen builders** (Webflow, Framer, Wix Studio, Builder.io), and
**app builders / low-code-vibe-coding** (Lovable, Bolt.new, Replit, v0, Base44) —
and turns raw noise (changelogs, release notes, subreddit threads, blog posts)
into digests you can read *and interrogate*.

Three categories instead of one matters architecturally: it forces the source
config and the synthesis agent to be **generic and domain-agnostic** from day
one, instead of hardcoded to one vertical. That's a realistic constraint —
production systems rarely stay single-purpose for long. It's a content
change, not an architecture one — `sources.config.json` just gets a third
domain key. The pipeline (worker → DB → app) doesn't change shape.

---

## 2. Architecture overview (revised — 3 pieces, not 5)

```
┌──────────────────────┐
│  GitHub Actions        │   (runs on a schedule — the "background process")
│  scheduled workflow    │
└──────────┬────────────┘
           │ runs
           ▼
┌──────────────────────┐        ┌──────────────────────┐
│  worker/ingest.ts       │───────▶│  Supabase Postgres      │
│  - fetch sources        │        │  + pgvector             │
│  - synthesis agent      │◀───────│  (raw items, digests,   │
│    (draft→critique)     │        │   embeddings)            │
└──────────────────────┘        └──────────┬───────────┘
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │  Next.js app             │
                                   │  - frontend (dashboard,  │
                                   │    chat UI)               │
                                   │  - API routes (chat,      │
                                   │    on-demand agent)       │
                                   └──────────────────────┘
```

Two of the three pieces (worker, Next.js app) share the same `lib/agent.ts` —
same tool-calling logic, triggered differently. That's the one distinction
this project is built to teach.

---

## 3. Tech stack (revised — optimized for low overwhelm and $0 cost)

Every split below was kept only if it teaches a genuinely new concept; everything
else was combined to reduce moving parts.

| Layer | Choice | Why |
|---|---|---|
| Frontend + Backend API | **One Next.js app** (React frontend + API routes together) | Combining these doesn't cost you the concept — routes vs. pages already show the request/response boundary clearly, without the overhead of two deploys, two URLs, and CORS |
| Language | **JavaScript/TypeScript everywhere** (no Python) | Learning a second language and agent design at the same time is exactly the overwhelm to avoid |
| Database | Postgres + `pgvector` extension, on **Supabase's free tier** | One database, two jobs (structured rows + embeddings), $0 to run |
| Worker | Node script triggered by a **GitHub Actions scheduled workflow** (free) | This is the one split worth keeping — a background process that runs without anyone asking is a genuinely different concept from a web request. GitHub Actions makes it free instead of needing a paid worker host |
| LLM | Claude API — pay-per-use, not a subscription | Fits your no-subscription constraint; cost at this scale is cents |
| Hosting | Vercel free tier (Next.js app) + Supabase free tier (DB) + GitHub Actions (worker) | Three pieces total, all free |

**Net result:** 3 moving pieces instead of 4-5, one language throughout, $0 in subscriptions.

---

## 4. Milestone roadmap

Each milestone ends with something *running*, not just code written — matches your preference for incremental builds.

### M0 — Foundations
**Goal:** empty-but-real skeleton: repo, DB connection, the Next.js app deployed to Vercel showing a placeholder page, and the worker script running once manually (before we even schedule it).
**You learn:** how the pieces talk to each other before any AI is involved.

### M1 — Source config + ingestion worker
**Goal:** worker pulls raw items (RSS/changelog/Reddit) for both domains on a schedule, stores them in Postgres.
**You learn:** scheduled jobs, idempotency (don't re-ingest the same item twice), handling flaky external APIs.

### M2 — Synthesis agent (draft → critique → revise)
**Goal:** turn a batch of raw items into a digest entry, with the agent checking its own draft against the source before saving.
**You learn:** multi-step LLM orchestration — the first real "agentic" piece, not just a single prompt.

### M3 — Memory layer
**Goal:** embed digests, store vectors, and make the agent aware of what it already told you (no repeats, tracks what you engage with).
**You learn:** vector search vs. relational lookups — when to use which.

### M4 — Chat + on-demand agent
**Goal:** chat interface where the agent decides: answer from stored digests, or go fetch something fresh.
**You learn:** tool-calling and routing logic — the agent making a decision, not just following a script.

### M5 — Frontend dashboard
**Goal:** the actual UI — digest feed + chat panel, styled the way you'd want a real product to look (minimal, no decoration you didn't ask for).
**You learn:** wiring a real frontend to a real backend, not a mock.

### M6 — Automate the schedule
**Goal:** the worker runs on its own via the GitHub Actions schedule — no more running it manually.
**You learn:** the difference between "code that works" and "code that runs itself" — the core background-process concept this project is built around.

### M7 — Polish + evaluate
**Goal:** look at a week of real digests, tune what's useful vs. noise, adjust the agent's judgment.
**You learn:** the unglamorous part of every AI product — evaluation and iteration.

---

## 5. Repo structure (revised)

```
signal/
├── app/                    # Next.js app (frontend pages + API routes together)
│   ├── api/                # chat + digest endpoints
│   └── (pages)/            # dashboard, chat UI
├── lib/
│   ├── db.ts               # shared Supabase/Postgres client
│   └── agent.ts            # shared LLM orchestration (used by both the app and the worker)
├── worker/
│   └── ingest.ts           # ingestion + synthesis script, run by GitHub Actions on a schedule
├── .github/workflows/
│   └── ingest.yml          # the schedule — this is the "background process" piece
├── sources.config.json     # your list of tracked sources, per domain
└── docs/
    └── decisions.md         # architecture decisions log — you write these as we go
```

One Next.js project, one worker script, one shared `lib/agent.ts` — the worker
and the app call the same underlying agent logic, just triggered differently
(a schedule vs. a user request). That contrast is the whole point of keeping
the worker separate.

---

## 6. Open decisions before we start M0

1. **Source list** — confirmed starting point: page/screen builders (Webflow, Framer, Wix Studio, Builder.io + r/webflow, r/framer). Form builders and app builders added in later milestones, once the pipeline is proven on one domain — same reasoning as starting with one worker script before scheduling it.
2. **Stack** — confirmed: Next.js (JS/TS only) + Supabase (Postgres/pgvector) + GitHub Actions worker. $0 in subscriptions, Claude API pay-per-use only.
3. **Accounts needed before M0**: GitHub (free), Vercel (free), Supabase (free), an Anthropic API key. Flag now if any of these need setting up first.

### Starter list for domain 3 — app builders (low-code/vibe coding)

Added for later (M1.5+, once page/screen builders are working end-to-end):

| Source | Type | Note |
|---|---|---|
| Lovable Blog + changelog | official | lovable.dev/blog |
| Bolt.new / StackBlitz Blog | official | bolt.new (blog/changelog) |
| Replit Blog | official | blog.replit.com |
| v0 (Vercel) Changelog | official | v0.dev/changelog |
| r/vibecoding, r/replit | community | fast-growing, high-signal on real usage pain points |

Worth flagging: this space moves faster and is noisier than page builders — lots of funding/valuation news, credit-pricing complaints, and marketing content mixed in with real product updates. That's actually a good stress test for the synthesis agent's judgment in M2 (does it distinguish "shipped a feature" from "raised a round"), but it's also more likely to produce noisy digests early on — worth expecting some tuning here.

## 7. Source roadmap — by signal quality, not by website

Sources aren't just "which websites" — they're different *kinds* of
product intelligence, and each kind needs a different fetching approach
with very different difficulty. This roadmap orders additions by how
hard each is to actually build, not by how valuable the signal is.

| Category | Signal it captures | Fetch difficulty | Status |
|---|---|---|---|
| Blog/changelog pages | What actually shipped | Medium — plain HTML, no auth, fragile if a site redesigns | **Active (M1)**, whole-page only for now |
| GitHub Releases | Official version history | Easy — free, official API, no approval wall | Next up after M1 proves the pipeline |
| Hacker News | Technical community reaction | Easy — free, official API, no auth | Next up alongside GitHub |
| RSS-based news (TechCrunch, VentureBeat, etc.) | Industry context — funding, launches, acquisitions | Medium — RSS usually exists for news sites, unlike company blogs | Later, once GitHub/HN are working |
| Reddit | Honest user feedback | **Blocked** — registration page broken as of July 2026, see decisions.md | Revisit later, or skip |
| Product Hunt | New entrants, positioning | Medium-hard — needs registered API access, similar friction to Reddit | Deferred |
| Discord / Slack communities | Real usage problems, practitioner talk | Hard — needs a bot installed inside someone else's server, a different category of effort | Deferred indefinitely |
| G2 / Capterra | Comparison trends, reviews | Hard — actively scraper-hostile | Probably out of scope for a solo project |

The pattern so far: start with whatever's easiest and free, prove the
pipeline works, then add the next-easiest thing — never jump straight to
the hardest source just because it'd be the most valuable one.
