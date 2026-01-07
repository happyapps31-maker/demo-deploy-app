"use client";

import { useState, useEffect } from "react";
import type { DeployLog } from "@/lib/schema";

export default function HomePage() {
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      const response = await fetch("/api/logs");
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function addLogEntry() {
    try {
      setSubmitting(true);
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message || `Deployed at ${new Date().toISOString()}`,
          source: "local",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add log");
      }

      setMessage("");
      await fetchLogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add log");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            LogFast
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Get your logs fast.
          </p>
        </header>

        <div className="mb-8 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message..."
            disabled={submitting}
            className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
          />
          <button
            onClick={addLogEntry}
            disabled={submitting}
            className="bg-zinc-900 text-white py-2 px-4 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Adding..." : "Add log entry"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <h2 className="text-lg font-semibold p-4 border-b border-zinc-200 text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
            Logs
          </h2>
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No logs yet. Click &quot;Add log entry&quot; to create one.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {logs.map((log) => (
                <li key={log.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 rounded mb-2 dark:bg-zinc-800 dark:text-zinc-300">
                        {log.source}
                      </span>
                      <p className="text-zinc-900 dark:text-zinc-100 wrap-break-word">
                        {log.message}
                      </p>
                    </div>
                    <time className="text-sm text-zinc-500 whitespace-nowrap shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
