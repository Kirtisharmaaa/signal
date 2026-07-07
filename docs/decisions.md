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
