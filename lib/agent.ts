/**
 * lib/agent.ts
 *
 * Shared agent logic — used by BOTH the worker (scheduled ingestion) and the
 * Next.js app (on-demand chat). This is the file that makes the "same logic,
 * triggered differently" idea concrete: the worker calls synthesizeDigest()
 * on a schedule, the chat API will later call answerQuestion() on request.
 *
 * M0: stubs only, so the pipeline shape exists before any real AI call.
 * M2 wires up synthesizeDigest() for real (draft -> critique -> revise).
 * M4 wires up answerQuestion() for real (tool-calling chat agent).
 */

export interface RawItem {
  source: string;
  domain: string;
  title: string;
  url: string;
  fetchedAt: string;
}

export interface Digest {
  domain: string;
  summary: string;
  itemCount: number;
  generatedAt: string;
}

/**
 * M0 stub: pretends to synthesize a digest from raw items.
 * Real version (M2) will call the Claude API with a draft -> critique -> revise loop.
 */
export async function synthesizeDigest(domain: string, items: RawItem[]): Promise<Digest> {
  return {
    domain,
    summary: `[stub] Would synthesize a digest from ${items.length} item(s) for "${domain}". Real synthesis lands in M2.`,
    itemCount: items.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * M4 stub: pretends to answer a chat question, deciding whether to use
 * stored digests or fetch something fresh.
 */
export async function answerQuestion(question: string): Promise<string> {
  return `[stub] Would answer: "${question}" using stored digests or a live fetch. Real version lands in M4.`;
}
