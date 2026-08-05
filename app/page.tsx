import Link from "next/link";
import { getDigests } from "@/lib/db";
import Chat from "./components/chat";
import SaveButton from "./components/save-button";
import DigestSummary from "./components/digest-summary";

function domainLabel(domain: string) {
  const labels: Record<string, string> = {
    "page-screen-builders": "Page Builders",
    "app-builders": "App Builders",
    "form-builders": "Form Builders",
  };
  return labels[domain] ?? domain;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function Home() {
  const digests = await getDigests(20);
  const insights = digests.slice(0, 3);
  const remaining = digests.slice(3);

  const byDomain = digests.reduce((acc, d) => {
    acc[d.domain] = (acc[d.domain] ?? 0) + d.item_count;
    return acc;
  }, {} as Record<string, number>);
  const total = Object.values(byDomain).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-2xl font-semibold tracking-widest uppercase mb-2">Signal</h1>
          <p className="text-sm text-gray-500">Weekly Intelligence Brief</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(new Date().toISOString())}</p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/products" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Products</Link>
            <Link href="/history" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">History</Link>
          </div>
        </header>

        {/* Insights */}
        <section className="mb-12">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">3 things you should know this week</p>
          <div className="flex flex-col">
            {insights.map((digest, i) => (
              <div key={digest.id} className="py-8 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">{i + 1}.</p>
                <div className="mb-3">
                  <DigestSummary summary={digest.summary} />
                </div>
                <p className="text-xs text-gray-400 mb-4">{digest.item_count} signals support this.</p>
                <div className="flex gap-2">
                  <Link href={`/digest/${digest.id}`} className="text-xs text-gray-500 border border-gray-200 rounded px-3 py-1 hover:border-gray-400 transition-colors inline-block">
                    Explore
                  </Link>
                  <SaveButton id={digest.id} initial={digest.saved ?? false} />
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100" />
          </div>
        </section>

        {/* Signal count strip */}
        <section className="mb-12 py-6 border-t border-b border-gray-100">
          <p className="text-sm text-gray-700 mb-2">{total} signals this week</p>
          <p className="text-xs text-gray-400">
            {Object.entries(byDomain).map(([domain, count], i) => (
              <span key={domain}>
                {i > 0 && " · "}+{count} {domainLabel(domain)}
              </span>
            ))}
          </p>
        </section>

        {/* Product Profiles link */}
        <div className="mb-12 flex justify-end">
          <Link href="/products" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            View product profiles →
          </Link>
        </div>

        {/* Trending Topics */}
        <section className="mb-12">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Trending Topics</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "MCP Support", keyword: "MCP" },
              { label: "AI Generation", keyword: "AI" },
              { label: "Pricing Changes", keyword: "pricing" },
              { label: "AI Agents", keyword: "agent" },
              { label: "Mobile Builders", keyword: "mobile" },
            ].map(({ label, keyword }) => (
              <Link
                key={label}
                href={`/investigate?topic=${encodeURIComponent(keyword)}&label=${encodeURIComponent(label)}&range=30d`}
                className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:border-gray-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* Product Signals */}
        <section className="mb-16">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Product Signals</p>
          {Object.entries(
            remaining.reduce((acc, d) => {
              if (!acc[d.domain]) acc[d.domain] = [];
              acc[d.domain].push(d);
              return acc;
            }, {} as Record<string, typeof remaining>)
          ).map(([domain, items]) => (
            <details key={domain} className="mb-4 border-t border-gray-100">
              <summary className="flex justify-between items-center py-4 cursor-pointer list-none text-sm font-medium text-gray-700 hover:text-gray-900">
                {domainLabel(domain)}
                <span className="text-xs text-gray-400">+{items.length}</span>
              </summary>
              <div className="flex flex-col gap-6 pb-6">
                {items.map((d) => (
                  <article key={d.id} className="border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-400">{formatDate(d.generated_at)} · {d.item_count} sources</p>
                      <Link href={`/digest/${d.id}`} className="text-xs text-slate-400 hover:text-slate-700 transition-colors shrink-0">
                        Open digest →
                      </Link>
                    </div>
                    <DigestSummary summary={d.summary} />
                  </article>
                ))}
              </div>
            </details>
          ))}
        </section>

        {/* Ask Signal */}
        <section>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Ask Signal</p>
          <Chat />
        </section>

      </main>
    </div>
  );
}
