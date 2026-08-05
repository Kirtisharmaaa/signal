import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, value } = await req.json();
  if (typeof id !== "number" || typeof value !== "boolean") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const db = getDb();
  const { error } = await db
    .from("digests")
    .update({ saved: value })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
