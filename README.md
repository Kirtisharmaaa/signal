# Signal

A product-intelligence agent that watches builder tools (page/screen
builders, form builders, app builders) and turns changelogs, blogs, and
community chatter into digests worth reading — with a chat interface that
can dig deeper on demand.

See `docs/decisions.md` for why things are built the way they are, and
the build plan doc for the full milestone roadmap.

---

## What's here (M0)

- `app/` — Next.js frontend + API routes (one app, not split into services)
- `worker/ingest.ts` — the background process, run manually for now
- `lib/agent.ts` — shared logic between the app and the worker (stubs for now)
- `lib/db.ts` — Supabase client (needs env vars, see below)
- `sources.config.json` — the list of tracked sources, by domain
- `.github/workflows/ingest.yml` — the scheduled job definition (manual trigger only for now)

## Run it locally

```bash
npm install
npm run dev        # starts the Next.js app at http://localhost:3000
npm run worker      # runs the ingestion worker once, manually
```

The worker will report the DB as "NOT CONFIGURED YET" until you set up
Supabase (next section) — that's expected at this stage.

## Accounts you'll need (things I can't do for you)

These all require your own login, so they're yours to set up. None of them
need a paid plan for this project.

1. **GitHub** — to host the repo and run the scheduled worker via GitHub Actions.
   - Create a new repo, then from this folder:
     ```bash
     git init
     git add .
     git commit -m "M0: foundations"
     git remote add origin <your-repo-url>
     git push -u origin main
     ```

2. **Supabase** — for the database (Postgres + pgvector), free tier.
   - Create a project at supabase.com.
   - Grab the Project URL and the `service_role` key (Settings → API).
   - Locally: create a `.env.local` file (already gitignored) with:
     ```
     SUPABASE_URL=your-project-url
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```
   - Run `npm run worker` again — the DB check should now say "OK".
   - In GitHub: add the same two values as **Repository secrets**
     (Settings → Secrets and variables → Actions), so the scheduled
     workflow can use them later (M6).

3. **Vercel** — to deploy the Next.js app, free tier.
   - Import the GitHub repo at vercel.com/new.
   - No environment variables needed yet for M0 (the placeholder page
     doesn't touch the DB). We'll add them when the app starts reading
     digests, in M5.

4. **Anthropic API key** — for the synthesis and chat agent, pay-per-use (no subscription).
   - Create a key at console.anthropic.com.
   - Add it locally to `.env.local` as `ANTHROPIC_API_KEY=...` and as a
     GitHub Actions secret, same as above. Not used yet until M2.

## Milestone status

- [x] M0 — Foundations (this)
- [ ] M1 — Source config + ingestion worker (real fetching)
- [ ] M2 — Synthesis agent (draft → critique → revise)
- [ ] M3 — Memory layer (embeddings + retrieval)
- [ ] M4 — Chat + on-demand agent
- [ ] M5 — Frontend dashboard
- [ ] M6 — Automate the schedule
- [ ] M7 — Polish + evaluate
