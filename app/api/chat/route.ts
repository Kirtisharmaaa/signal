import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, answerQuestion } from "@/lib/agent";
import { findSimilarDigests } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const embedding = await generateEmbedding(message);
    const relevantDigests = await findSimilarDigests(embedding);
    const answer = await answerQuestion(message, relevantDigests);

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}