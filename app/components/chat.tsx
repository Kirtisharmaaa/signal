"use client";

import { useState } from "react";

const suggestions = [
  "what products support MCP?",
  "which company is growing fastest?",
  "compare lovable and bolt",
  "summarize this month's trends",
];

export default function Chat() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong");
      else setAnswer(data.answer);
    } catch {
      setError("Failed to reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setMessage(s)}
            className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ask anything about the builder tools space..."
          rows={3}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="self-start px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>
      {answer && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm whitespace-pre-wrap leading-relaxed text-gray-700">
          {answer}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}