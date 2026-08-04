"use client";

import { useState } from "react";

export default function FeedbackButtons({ id, initial }: { id: number; initial: boolean | null }) {
  const [value, setValue] = useState<boolean | null>(initial);

  async function submit(v: boolean) {
    const next = value === v ? null : v; // clicking same button toggles off
    setValue(next);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, value: next ?? v }),
    });
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => submit(true)}
        className={`text-xs px-2 py-1 rounded border transition-colors ${
          value === true
            ? "border-gray-400 text-gray-700 bg-gray-100"
            : "border-gray-200 text-gray-400 hover:border-gray-400"
        }`}
      >
        ↑
      </button>
      <button
        onClick={() => submit(false)}
        className={`text-xs px-2 py-1 rounded border transition-colors ${
          value === false
            ? "border-gray-400 text-gray-700 bg-gray-100"
            : "border-gray-200 text-gray-400 hover:border-gray-400"
        }`}
      >
        ↓
      </button>
    </div>
  );
}