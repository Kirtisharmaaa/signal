# Signal — UI/UX Plan
### Revised v2 — July 2026

---

## What Signal Is (and Isn't)

Signal is not a news digest. It's not an RSS reader. It's not a chatbot.

It's a **product intelligence system** — purpose-built for the form builder, page builder, and app builder space. The value it delivers is not "here are today's updates." It's:

> "Here's what changed across the space this week, what it means, and what you should investigate."

The primary audience: PMs, founders, designers, developers who need to understand a competitive space without drowning in it.

The mental model: **Perplexity's research depth + AlphaSense's intelligence framing + Linear's minimalism + Notion's clean information hierarchy.**

---

## Core UX Principle: Signal → Insight → Investigation

Everything in the UI flows through this single hierarchy.

```
Signal          What actually happened (one product, one event)
   ↓
Insight         What it means across the space (cross-product synthesis)
   ↓
Investigation   Asking deeper questions, comparing, exploring history
```

The AI's job is to have done the synthesis *before* you open the app. You arrive to conclusions, not inputs. That's what separates Signal from Feedly, Google Alerts, or a curated Slack channel.

---

## Information Hierarchy

This is the order in which information is presented across the entire product — from most synthesized to most raw.

```
Insights          (what matters this week — AI's top conclusions)
      ↓
Trending Topics   (cross-product themes, clickable into investigations)
      ↓
Product Signals   (what each product shipped, by category)
      ↓
Investigations    (time-based + comparison views)
      ↓
Ask Signal        (contextual chat for deeper questions)
      ↓
Product Profiles  (per-product intelligence pages)
      ↓
History           (saved investigations and past queries)
```

Users should never have to scroll through raw signals to discover what matters. The most synthesized conclusions sit at the top. Signal data is supporting evidence, not the primary thing users consume.

---

## Primary Screen — Weekly Intelligence Brief

Single-column layout. No sidebar. No personalization in V1.

```
─────────────────────────────────────────────────

                      SIGNAL

              Weekly Intelligence Brief
                   July 30, 2026

─────────────────────────────────────────────────

  3 things you should know this week

─────────────────────────────────────────────────

  1.

  App builders are converging on MCP faster
  than page builders — and the gap is widening.

  12 signals support this trend.

                                        [Explore]

─────────────────────────────────────────────────

  2.

  Framer has shipped 3 consecutive developer-
  focused releases. This may indicate movement
  toward the app-builder space.

  4 signals support this.

                                        [Explore]

─────────────────────────────────────────────────

  3.

  Pricing changes increased 37% this month
  across app builders — concentrated in
  Lovable, Bolt, and v0.

  7 signals support this.

                                        [Explore]

─────────────────────────────────────────────────

  42 signals this week

  +15 Page Builders · +11 Form Builders · +16 App Builders

─────────────────────────────────────────────────

  Trending Topics

  MCP Support   AI Form Generation   Pricing Changes
  AI Agents     Mobile Builders

─────────────────────────────────────────────────

  Page Builders                                 +15
  ───────────────────────────────────────────────
  Framer shipped a new code component API...
  Webflow launched their CMS v2 beta...
  Builder.io introduced visual AI editing...

  Form Builders                                 +11
  ───────────────────────────────────────────────
  Typeform introduced conditional AI routing...
  Jotform added native payment splits...
  Tally released a Notion sync integration...

  App Builders                                  +16
  ───────────────────────────────────────────────
  Lovable shipped one-click Supabase setup...
  v0 added multi-file component generation...
  Bolt.new introduced real-time preview sync...

─────────────────────────────────────────────────

                     Ask Signal

  > what products support MCP?
  > which company is growing fastest?
  > compare lovable and bolt
  > summarize this month's trends

─────────────────────────────────────────────────
```

**Design notes:**
- Insights lead — users arrive to conclusions, not a count
- "3 things you should know" is a deliberate constraint on the AI — forces prioritization, not exhaustiveness
- Signal counts (+15, +11, +16) appear below the insights, as supporting data
- No "Good morning Kirti" — no personalization in V1, cleaner without it
- Ask Signal at the bottom — it's a depth tool, not the entry point

---

## Signal Detail View

When you click any signal, you never see the raw article.

```
─────────────────────────────────────────────────

  Framer introduced a new code component API
  that allows components to be imported
  directly from npm packages.

  Why it matters
  ──────────────
  This is the third developer-facing release in
  a row from Framer. Combined with their new
  CLI tooling, it suggests Framer is repositioning
  from a designer tool toward a full-stack app
  builder — competing more directly with Webflow
  and potentially Bolt.new.

  Related signals
  ──────────────
  Builder.io shipped a visual AI editing layer
  targeting the same developer-designer overlap.

  Webflow announced headless CMS export, moving
  further toward developer control.

  v0 released multi-file generation, which
  makes single-component flows feel limited
  by comparison.

  Sources
  ──────────
  Official Framer blog
  Framer changelog
  Hacker News discussion (47 comments)

                              [Ask Signal ↓]
  > compare this with Webflow's trajectory
  > summarize Framer's last 30 days
  > which products are most similar to this?

─────────────────────────────────────────────────
```

The synthesis is the product. Sources are attribution, not the destination. Never show raw articles.

---

## Trending Topic / Investigation View

Clicking any Trending Topic opens a time-based investigation — not just a filtered feed.

```
─────────────────────────────────────────────────

  MCP Adoption

  Last 90 days

─────────────────────────────────────────────────

  12 products mentioned MCP
   8 shipped integrations
   3 announced roadmaps
   1 abandoned implementation

─────────────────────────────────────────────────

  Timeline

  May
  ───
  v0 announced MCP support

  June
  ────
  Framer shipped MCP APIs
  Webflow announced MCP roadmap

  July
  ────
  Lovable adopted MCP as primary integration layer
  Builder.io announced public beta

─────────────────────────────────────────────────

  Key insight

  App builders are adopting MCP three times
  faster than form builders. Page builders
  are in the middle — Webflow announced but
  hasn't shipped; Framer has shipped.

─────────────────────────────────────────────────

  Ask Signal

  > who's still behind?
  > compare adoption rates
  > which form builders are next?

─────────────────────────────────────────────────
```

**Time range options:** Last 7 days · Last 30 days · Last 90 days · Last year

This is where the memory layer (M3) pays off. Users can investigate trends through time, not just isolated updates. Every Trending Topic is an entry point into a time-based investigation.

---

## Product Profiles (M4–M5)

Moved earlier than originally planned. Once the memory layer has 60+ days of data, these become the most useful view in the product — essentially mini CB Insights pages for every tracked product.

```
─────────────────────────────────────────────────

  Framer

─────────────────────────────────────────────────

  Signals this month          +21
  vs. last month              +14  ↑ 50%

─────────────────────────────────────────────────

  Trending Topics

  MCP · AI · APIs · CMS · Developer Tools

─────────────────────────────────────────────────

  Compared with

  Webflow · Builder.io · Bolt.new

─────────────────────────────────────────────────

  Recently shipped

  Code component API (npm imports)
  CLI tooling for local dev
  MCP integration (developer preview)

─────────────────────────────────────────────────

  Community discussion

  "Framer is quietly becoming the most
  developer-friendly page builder..."
  HN thread — 134 comments

─────────────────────────────────────────────────

  AI summary

  Framer appears to be repositioning from a
  designer-first tool toward the app-builder
  space. Three consecutive developer-focused
  releases and a new CLI suggest this is
  intentional, not incidental.

─────────────────────────────────────────────────

  Ask Signal

  > compare Framer with Webflow
  > what has Framer shipped in 90 days?
  > who are Framer's closest competitors now?

─────────────────────────────────────────────────
```

**Why M4–M5, not M6+:** Product Profiles need ~60 days of ingested signals to be meaningful. If the pipeline is running from M1, profiles become useful by M4. Building them at M6 wastes months of accumulated data.

---

## Chat / Ask Signal

Not a fullscreen chat. Contextual — lives inline, triggered from anywhere.

```
─────────────────────────────────────────────────

  Ask Signal

  > Which companies added MCP support?

  Searching signals...

─────────────────────────────────────────────────

  Webflow
  ───────
  Added MCP server support in their v3.1 release,
  allowing external tools to read/write CMS content.

  Framer
  ──────
  MCP shipped as part of their developer API
  milestone. Currently in developer preview.

  Lovable
  ───────
  Adopted MCP as their primary integration layer,
  replacing the previous webhook approach.

  Bolt.new
  ────────
  MCP flagged in GitHub roadmap. Not yet shipped.

  Sources
  ───────
  4 official blogs · 3 changelogs · 2 GitHub releases

─────────────────────────────────────────────────

  Related questions

  compare lovable vs v0
  summarize this week
  pricing trends this month

─────────────────────────────────────────────────
```

**Behavior rules:**
- [Explore] on any Insight pre-loads that topic as context
- Responses are always product-by-product, never a paragraph blob
- Sources shown as count summary; full links available on request
- Related questions generated from current response content, not static suggestions
- Time-based queries supported: "what happened last month with MCP" works

---

## UX Flow

```
Home (Weekly Intelligence Brief)
            │
            ▼
    ┌───────┴────────┐
    ▼                ▼
Insight [Explore]   Trending Topic
    │                │
    └───────┬────────┘
            ▼
    Investigation View
    (time-based: 7d / 30d / 90d / 1yr)
            │
    ┌───────┴────────┐
    ▼                ▼
Signal Detail    Product Profile
(Why it matters, (per-product
Related signals) intelligence page)
            │
            ▼
       Ask Signal
       (contextual)
            │
            ▼
    Related Questions
            │
            ▼
      Save Insight *
            │
            ▼
         History **
```

**\* Save Insight (M4):** Starred list, re-queryable via chat. One boolean column in Supabase. Not a notes layer.

**\*\* History (M5+):** Past investigations and Ask Signal threads. Useful once M3 memory layer has real retrieval depth.

---

## Mobile Layout

Same hierarchy, compressed. Insights still lead.

```
─────────────────────────

  SIGNAL
  July 30, 2026

─────────────────────────

  3 things this week

  1. App builders converging
     on MCP faster than page
     builders.        [→]

  2. Framer: 3 consecutive
     developer releases.  [→]

  3. Pricing up 37% in
     app builders.    [→]

─────────────────────────

  Trending

  MCP · AI Forms · Pricing
  AI Agents · Mobile

─────────────────────────

  42 signals
  +15 Page · +11 Form · +16 App

─────────────────────────

  Ask Signal

  ┌──────────────────────┐
  │                      │
  └──────────────────────┘

─────────────────────────
```

No sidebars. No charts. No multi-column layouts. Insights first, always.

---

## Future Feature: Relationship Maps (Post-M5)

A trend-first view, complementing the product-first view of Product Profiles.

```
                     MCP
                      │
          ────────────────────────
          │           │          │
       Framer      Webflow    Lovable
          │           │
       AI APIs      CMS APIs
          │           │
       Builder      Wix
            \       /
             \     /
              Bolt


  Signal detected:
  4 products are converging on the same
  integration model.

                               [Investigate]
```

Analysts think in two directions: "What is Framer doing?" and "What's happening with MCP?" Relationship Maps support the second question at scale. This becomes buildable when 6+ months of signals exist and cross-product patterns are statistically meaningful.

---

## Milestone Map (UI Features by Build Phase)

| Milestone | UI feature unlocked |
|---|---|
| M2 | Signal detail view (Why it matters, Related signals) |
| M2 | Thumbs up/down feedback on every card |
| M3 | Time-based investigation view (7d / 30d / 90d) |
| M3 | Trending Topic pages |
| M4 | Ask Signal with time-range support |
| M4 | Save Insight (starred list) |
| M4–M5 | Product Profiles |
| M5 | History view |
| M6+ | Relationship Maps |
| M6+ | Trend Timeline |

---

## What's Not Being Built (and Why)

| Rejected pattern | Reason |
|---|---|
| "Good morning Kirti" personalization | No auth / user model in V1; cleaner without it |
| Signal count as hero ("42 new signals") | Count is data, not intelligence — wrong opening |
| Two-panel RSS feed layout | Trains "check regularly" mental model — wrong |
| Fullscreen chat as primary UI | Buries the synthesis; makes Signal look like a chatbot |
| Charts and analytics dashboards (M0–M4) | No longitudinal data; charts would be decoration |
| Sidebar navigation | Unnecessary hierarchy at this stage |
| Raw article links as primary CTA | Sends users away from the product |

---

## Source Health (Operational, Not Featured)

A collapsed strip at the top of the main screen. Green / yellow (stale >48h) / red (failed fetch) per source. Collapsed by default.

Purpose: silent scraper failures should not look like "nothing shipped this week."

---

## Feedback Loop

Thumbs up / thumbs down on every signal card. One boolean column in Supabase. Built at M2.

This is the mechanism that makes M7 tuning evidence-based. Without it, "tune what's useful vs. noise" is guesswork.
