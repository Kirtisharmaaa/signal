import { getSavedDigests, getChatHistory } from "@/lib/db";
import Link from "next/link";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
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

const rangeLabel: Record<string, string> = {
  "all": "All time",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export default async function HistoryPage() {
  const [saved, chatHistory] = await Promise.all([
    getSavedDigests(),
    getChatHistory(20),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-16">

        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-12 inline-block">
          ← Back
        </Link>

        <header className="mb-12">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">History</h1>
          <p className="text-sm text-gray-400">Saved insights and past Ask Signal queries.</p>
        </header>

        {/* Saved Insights */}
        <section className="mb-14">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
            Saved Insights {saved.length > 0 && `· ${saved.length}`}
          </p>
          {saved.length === 0 ? (
            <p className="text-sm text-gray-400">No saved insights yet — use the ☆ Save button on any insight card.</p>
          ) : (
            <div className="flex flex-col">
              {saved.map((d) => (
                <Link key={d.id} href={`/digest/${d.id}`} className="group border-t border-gray-100 py-5">
                  <p className="text-xs text-gray-400 mb-2">
                    {domainLabel(d.domain)} · {formatDate(d.generated_at)}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                    {cleanSummary(d.summary).slice(0, 200)}…
                  </p>
                </Link>
              ))}
              <div className="border-t border-gray-100" />
            </div>
          )}
        </section>

        {/* Past Questions */}
        <section>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
            Past Questions {chatHistory.length > 0 && `· ${chatHistory.length}`}
          </p>
          {chatHistory.length === 0 ? (
            <p className="text-sm text-gray-400">No questions asked yet — try Ask Signal on the home page.</p>
          ) : (
            <div className="flex flex-col">
              {chatHistory.map((entry) => (
                <div key={entry.id} className="border-t border-gray-100 py-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-800">{entry.question}</p>
                    <span className="text-xs text-gray-400 ml-4 shrink-0">
                      {rangeLabel[entry.range] ?? entry.range}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{formatTime(entry.created_at)}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{entry.answer.slice(0, 300)}…</p>
                </div>
              ))}
              <div className="border-t border-gray-100" />
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
