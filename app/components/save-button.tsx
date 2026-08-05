"use client";

import { useState } from "react";

export default function SaveButton({ id, initial }: { id: number; initial: boolean }) {
  const [saved, setSaved] = useState(initial);

  async function toggle() {
    const next = !saved;
    setSaved(next);
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, value: next }),
    });
  }

  return (
    <button
      onClick={toggle}
      title={saved ? "Remove from saved" : "Save insight"}
      className={`text-xs px-2 py-1 rounded border transition-colors ${
        saved
          ? "border-gray-400 text-gray-700 bg-gray-100"
          : "border-gray-200 text-gray-400 hover:border-gray-400"
      }`}
    >
      {saved ? "★ Saved" : "☆ Save"}
    </button>
  );
}
