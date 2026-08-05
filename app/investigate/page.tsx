import { getDigestsByDateRange } from "@/lib/db";
import Link from "next/link";
import DigestSummary from "@/app/components/digest-summary";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function domainLabel(domain: string) {
  const labels: Record<string, string> = {
    "page-screen-builders": "Page Builders",
    "app-builders": "App Builders",
    "form-builders": "Form Builders",
  };
  return labels[domain] ?? domain;
}

const RANGES = ["7d", "30d", "90d", "1yr"] as const;
type Range = typeof RANGES[number];

const rangeLabel: Record<Range, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "1yr": "Last year",
};

export default async function InvestigatePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; label?: string; range?: string }>;
}) {
  const { topic, label, range: rawRange } = await searchParams;
  const range: Range = RANGES.includes(rawRange as Range) ? (rawRange as Range) : "30d";

  const digests = await getDigestsByDateRange(range, topic);

  const byMonth = digests.reduce((acc, d) => {
    const month = formatMonth(d.generated_at);
    if (!acc[month]) acc[month] = [];
    acc[month].push(d);
    return acc;
  }, {} as Record<string, typeof digests>);

  const total = digests.reduce((sum, d) => sum + d.item_count, 0);
  const domains = [...new Set(digests.map((d) => d.domain))];

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-6 py-14 sm:px-8 lg:px-10">

        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-12 inline-block">
          ← Back
        </Link>

        <header className="mb-10">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            {label ?? topic ?? "All Signals"}
          </h1>
          <p className="text-sm text-gray-400">{rangeLabel[range]}</p>
        </header>

        {/* Stats strip */}
        <div className="flex gap-6 mb-8 py-4 border-t border-b border-gray-100 text-sm text-gray-600">
          <span>{digests.length} digests</span>
          <span>{total} total signals</span>
          <span>{domains.map(domainLabel).join(" · ")}</span>
        </div>

        {/* Range selector */}
        <div className="flex gap-2 mb-10">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/investigate?${topic ? `topic=${encodeURIComponent(topic)}&` : ""}${label ? `label=${encodeURIComponent(label)}&` : ""}range=${r}`}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                r === range
                  ? "border-gray-400 text-gray-700 bg-gray-100"
                  : "border-gray-200 text-gray-400 hover:border-gray-400"
              }`}
            >
              {rangeLabel[r]}
            </Link>
          ))}
        </div>

        {/* Timeline */}
        {digests.length === 0 ? (
          <p className="text-sm text-slate-400">No signals found for this topic and time range.</p>
        ) : (
          <div className="flex flex-col">
            {Object.entries(byMonth).map(([month, items]) => (
              <section key={month} className="mb-14">
                <p className="mb-5 text-xs font-medium uppercase tracking-widest text-slate-400">
                  {month}
                </p>
                <div className="flex flex-col gap-10">
                  {items.map((d) => (
                    <article key={d.id} className="border-t border-slate-200 pt-6">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                          {domainLabel(d.domain)} · {formatDate(d.generated_at)}
                        </p>
                        <Link
                          href={`/digest/${d.id}`}
                          className="shrink-0 text-xs text-slate-400 transition-colors hover:text-slate-700"
                        >
                          Open digest →
                        </Link>
                      </div>
                      <DigestSummary summary={d.summary} />
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
