import { getDigests } from "@/lib/db";
import Chat from "./components/chat";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function cleanSummary(text: string) {
  return text
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();
}

export default async function Home() {
  const digests = await getDigests(20);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-8 py-5">
        <h1 className="text-lg font-semibold tracking-tight">Signal</h1>
        <p className="text-sm text-gray-500 mt-1">Product intelligence for builder tools</p>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-[1fr_380px] gap-10">
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-5">
            Latest Digests
          </h2>
          {digests.length === 0 ? (
            <p className="text-sm text-gray-400">No digests yet — run the worker to generate some.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {digests.map((digest) => (
                <article
                  key={digest.id}
                  className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {digest.domain}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(digest.generated_at)}</span>
                    <span className="text-xs text-gray-400">· {digest.item_count} sources</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {cleanSummary(digest.summary)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="sticky top-8 self-start">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-5">
            Ask the agent
          </h2>
          <Chat />
        </aside>
      </main>
    </div>
  );
}