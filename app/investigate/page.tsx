import { getDigestsByDateRange } from "@/lib/db";
import Link from "next/link";

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

function cleanSummary(text: string) {
  return text.replace(/^#+\s+/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
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

  // Group digests by month
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
      <main className="max-w-2xl mx-auto px-6 py-16">

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
          <p className="text-sm text-gray-400">No signals found for this topic and time range.</p>
        ) : (
          <div className="flex flex-col">
            {Object.entries(byMonth).map(([month, items]) => (
              <div key={month} className="mb-10">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">{month}</p>
                <div className="flex flex-col gap-6">
                  {items.map((d) => (
                    <Link key={d.id} href={`/digest/${d.id}`} className="group border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-400 mb-1">{domainLabel(d.domain)} · {formatDate(d.generated_at)}</p>
                      <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                        {cleanSummary(d.summary).slice(0, 200)}…
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}