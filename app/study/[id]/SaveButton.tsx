"use client";

import { useState } from "react";

export default function SaveButton({ studyId }: { studyId: number }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyId, direction: "right" }),
    });
    setSaved(true);
    setLoading(false);
  }

  return (
    <button
      onClick={handleSave}
      disabled={saved || loading}
      className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
        saved
          ? "bg-teal-500/20 text-teal-400 cursor-default"
          : "bg-slate-700 hover:bg-teal-500/20 text-slate-300 hover:text-teal-400"
      }`}
    >
      {saved ? "✓ Sauvegardée" : loading ? "…" : "Sauvegarder"}
    </button>
  );
}
