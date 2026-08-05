import { getDigestsByKeyword } from "@/lib/db";
import { getProductBySlug } from "@/lib/products";
import Link from "next/link";
import { notFound } from "next/navigation";

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

function cleanSummary(text: string) {
  return text.replace(/^#+\s+/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const product = getProductBySlug(name);
  if (!product) notFound();

  const digests = await getDigestsByKeyword(product.keyword);
  const recent = digests.slice(0, 5);
  const total = digests.reduce((sum, d) => sum + d.item_count, 0);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-16">

        <Link href="/products" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-12 inline-block">
          ← All Products
        </Link>

        <header className="mb-10">
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {domainLabel(product.domain)}
          </span>
          <h1 className="text-2xl font-semibold text-gray-900 mt-4 mb-1">{product.name}</h1>
          <p className="text-sm text-gray-400">
            {digests.length} digests · {total} total signals
          </p>
        </header>

        {/* Quick actions */}
        <div className="flex gap-3 mb-12">
          <Link
            href={`/investigate?topic=${encodeURIComponent(product.keyword)}&label=${encodeURIComponent(product.name)}&range=90d`}
            className="text-xs border border-gray-200 rounded px-3 py-1 text-gray-600 hover:border-gray-400 transition-colors"
          >
            Investigate last 90 days
          </Link>
          <Link
            href={`/?ask=${encodeURIComponent(`summarize ${product.name}`)}`}
            className="text-xs border border-gray-200 rounded px-3 py-1 text-gray-600 hover:border-gray-400 transition-colors"
          >
            Ask Signal
          </Link>
        </div>

        {/* Recent signals */}
        <section>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Recently mentioned in</p>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400">No signals found for {product.name} yet.</p>
          ) : (
            <div className="flex flex-col">
              {recent.map((d) => (
                <Link key={d.id} href={`/digest/${d.id}`} className="group border-t border-gray-100 py-5">
                  <p className="text-xs text-gray-400 mb-2">{formatDate(d.generated_at)} · {domainLabel(d.domain)}</p>
                  <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                    {cleanSummary(d.summary).slice(0, 220)}…
                  </p>
                </Link>
              ))}
              <div className="border-t border-gray-100" />
            </div>
          )}
        </section>

        {digests.length > 5 && (
          <div className="mt-6">
            <Link
              href={`/investigate?topic=${encodeURIComponent(product.keyword)}&label=${encodeURIComponent(product.name)}&range=1yr`}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              View all {digests.length} digests →
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
