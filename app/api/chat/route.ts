import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, answerQuestion } from "@/lib/agent";
import { findSimilarDigests, getDigestsByDateRange, saveChatHistory } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { message, range } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    let relevantDigests;

    if (range && range !== "all") {
      // Date-range mode: fetch all digests in the time window
      const dated = await getDigestsByDateRange(range, undefined);
      relevantDigests = dated.map((d) => ({ ...d, similarity: 1 }));
    } else {
      // Default: semantic vector search across all time
      const embedding = await generateEmbedding(message);
      relevantDigests = await findSimilarDigests(embedding);
    }

    const answer = await answerQuestion(message, relevantDigests);
    await saveChatHistory(message, answer, range ?? "all");
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
