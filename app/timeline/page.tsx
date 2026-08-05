import { getDigestTimeline } from "@/lib/db";
import Link from "next/link";

function domainLabel(domain: string) {
  const labels: Record<string, string> = {
    "page-screen-builders": "Page Builders",
    "app-builders": "App Builders",
    "form-builders": "Form Builders",
  };
  return labels[domain] ?? domain;
}

function startOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function formatWeek(weekKey: string): string {
  return new Date(weekKey).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

const DOMAIN_COLORS: Record<string, string> = {
  "page-screen-builders": "bg-blue-400",
  "app-builders": "bg-violet-400",
  "form-builders": "bg-emerald-400",
};

export default async function TimelinePage() {
  const rows = await getDigestTimeline();

  // Group by week and domain
  const weekMap: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const week = startOfWeek(new Date(row.generated_at));
    if (!weekMap[week]) weekMap[week] = {};
    weekMap[week][row.domain] = (weekMap[week][row.domain] ?? 0) + row.item_count;
  }

  const weeks = Object.keys(weekMap).sort();
  const domains = [...new Set(rows.map((r) => r.domain))];
  const maxCount = Math.max(...weeks.map((w) => Object.values(weekMap[w]).reduce((a, b) => a + b, 0)));

  const totalSignals = rows.reduce((sum, r) => sum + r.item_count, 0);
  const totalDigests = rows.length;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-12 inline-block">
          ← Back
        </Link>

        <header className="mb-10">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Trend Timeline</h1>
          <p className="text-sm text-gray-400">{totalSignals} total signals across {totalDigests} digests</p>
        </header>

        {/* Legend */}
        <div className="flex gap-4 mb-10">
          {domains.map((d) => (
            <div key={d} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${DOMAIN_COLORS[d] ?? "bg-gray-400"}`} />
              <span className="text-xs text-gray-500">{domainLabel(d)}</span>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="flex flex-col gap-3">
          {weeks.map((week) => {
            const weekTotal = Object.values(weekMap[week]).reduce((a, b) => a + b, 0);
            const widthPct = maxCount > 0 ? (weekTotal / maxCount) * 100 : 0;
            return (
              <div key={week} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 shrink-0 text-right">
                  {formatWeek(week)}
                </span>
                <div className="flex-1 flex gap-0.5 h-6 rounded overflow-hidden bg-gray-50">
                  {domains.map((d) => {
                    const count = weekMap[week][d] ?? 0;
                    const segPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    if (segPct === 0) return null;
                    return (
                      <div
                        key={d}
                        className={`${DOMAIN_COLORS[d] ?? "bg-gray-400"} h-full transition-all`}
                        style={{ width: `${segPct}%` }}
                        title={`${domainLabel(d)}: ${count} signals`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-gray-400 w-8 shrink-0">{weekTotal}</span>
              </div>
            );
          })}
        </div>

        {/* Per-domain totals */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">By Domain</p>
          <div className="flex flex-col gap-4">
            {domains.map((d) => {
              const domainTotal = rows
                .filter((r) => r.domain === d)
                .reduce((sum, r) => sum + r.item_count, 0);
              const pct = totalSignals > 0 ? Math.round((domainTotal / totalSignals) * 100) : 0;
              return (
                <div key={d}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700">{domainLabel(d)}</span>
                    <span className="text-gray-400">{domainTotal} signals · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${DOMAIN_COLORS[d] ?? "bg-gray-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
