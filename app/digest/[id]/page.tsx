import { getDigestById, findSimilarDigests } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeedbackButtons from "@/app/components/feedback-buttons";
import DigestSummary from "@/app/components/digest-summary";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
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

export default async function DigestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (isNaN(id)) notFound();

  const digest = await getDigestById(id);
  if (!digest) notFound();

  const related = digest.embedding
    ? (await findSimilarDigests(digest.embedding, 4)).filter((d) => d.id !== id)
    : [];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-16">

        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-12 inline-block">
          ← Back
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {domainLabel(digest.domain)}
          </span>
          <span className="text-xs text-gray-400">{formatDate(digest.generated_at)}</span>
          <span className="text-xs text-gray-400">· {digest.item_count} sources</span>
        </div>
        <FeedbackButtons id={digest.id} initial={digest.feedback ?? null} />

        <section className="mb-12 mt-8">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">Summary</p>
          <DigestSummary summary={digest.summary} />
        </section>

        <section className="mb-12 border-t border-gray-100 pt-10">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">Why it matters</p>
          <p className="text-sm text-gray-500 italic">
            AI-generated analysis coming soon. For now, see the summary above.
          </p>
        </section>

        {related.length > 0 && (
          <section className="border-t border-gray-100 pt-10">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-6">Related signals</p>
            <div className="flex flex-col gap-8">
              {related.map((r) => (
                <article key={r.id} className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400">{domainLabel(r.domain)} · {formatDate(r.generated_at)}</p>
                    <Link href={`/digest/${r.id}`} className="text-xs text-slate-400 hover:text-slate-700 transition-colors shrink-0">
                      Open digest →
                    </Link>
                  </div>
                  <DigestSummary summary={r.summary} />
                </article>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
