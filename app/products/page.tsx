import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

function domainLabel(domain: string) {
  const labels: Record<string, string> = {
    "page-screen-builders": "Page Builders",
    "app-builders": "App Builders",
    "form-builders": "Form Builders",
  };
  return labels[domain] ?? domain;
}

export default function ProductsPage() {
  const domains = [...new Set(PRODUCTS.map((p) => p.domain))];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-16">

        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-12 inline-block">
          ← Back
        </Link>

        <header className="mb-12">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Product Profiles</h1>
          <p className="text-sm text-gray-400">Per-product intelligence from tracked sources.</p>
        </header>

        {domains.map((domain) => (
          <section key={domain} className="mb-10">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">{domainLabel(domain)}</p>
            <div className="flex flex-col">
              {PRODUCTS.filter((p) => p.domain === domain).map((product) => (
                <Link
                  key={product.slug}
                  href={`/product/${product.slug}`}
                  className="flex justify-between items-center py-4 border-t border-gray-100 group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {product.name}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

      </main>
    </div>
  );
}
