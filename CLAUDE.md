# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Signal
Full plan: @docs/build-plan.md
Decisions so far: @docs/decisions.md

Product-intelligence agent for builder tools (page/screen builders first,
form builders and app builders added later).

## How I want to work
- I'm learning software architecture and agentic AI hands-on.
- I do the typing and running of commands myself — explain what a piece
  is, what it does, and why, BEFORE writing it, then let me write/run it.
- Only write large boilerplate directly (e.g. finicky config files) — and
  explain it fully afterward before I move on.
- Stack: Next.js (TypeScript only, no Python), Supabase (Postgres +
  pgvector), GitHub Actions for the scheduled worker. No paid subscriptions.

## Commands

```bash
npm install
npm run dev        # Next.js app at http://localhost:3000
npm run worker     # run the ingestion worker once, manually (tsx worker/ingest.ts)
npm run build       # production build
npm run lint         # eslint
```

There is no test suite yet. The worker is the only script run outside the
Next.js request cycle, and it's invoked directly with `tsx` (no compile step).

Local env vars go in `.env.local` (gitignored): `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`. The same three are set as
GitHub Actions repository secrets for the worker (see
`.github/workflows/ingest.yml`).

## Architecture

Three moving pieces, intentionally kept to three — see `docs/build-plan.md`
section 2-3 for the reasoning:

- **`app/`** — one Next.js app for both frontend pages and API routes (no
  separate backend service).
- **`worker/ingest.ts`** — a standalone script, not part of the Next.js app,
  run by GitHub Actions on a schedule (`.github/workflows/ingest.yml`). This
  is the one deliberate split in the project: a process that runs itself vs.
  one that waits for a request.
- **`lib/`** — shared code imported by both the app and the worker:
  - `lib/agent.ts` — the LLM orchestration logic. `synthesizeDigest()` is
    called by the worker on a schedule; `answerQuestion()` will be called by
    the app's chat API route on demand. Same underlying agent, two triggers
    — that contrast is the core concept this repo is built to teach.
  - `lib/db.ts` — shared Supabase (Postgres + pgvector) client, via
    `getDb()`. Throws if `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` aren't
    set, rather than failing silently.
- **`sources.config.json`** — the list of tracked sources, grouped by domain
  key (`page-screen-builders`, `form-builders`, `app-builders`). Each domain
  has an `active` flag; the worker only processes active domains. Adding a
  new domain or source is a config change, not a code change — the worker
  and agent logic are meant to stay domain-agnostic.

The project is being built milestone-by-milestone (M0–M7, see
`docs/build-plan.md` section 4 and the checklist in `README.md`). Currently
at **M0**: the pipeline shape exists end-to-end (config → worker →
stub-agent → DB-check) but `lib/agent.ts`'s functions are stubs and
`worker/ingest.ts` doesn't fetch real sources yet. When implementing a
milestone, check which stub it's meant to replace before adding new files —
the shape usually already exists.

Styling is Tailwind CSS v4 (via `@tailwindcss/postcss`), no component
library. No `next/font/google` — a system font stack is used instead
(see `docs/decisions.md`), so don't reintroduce a Google Fonts import.
