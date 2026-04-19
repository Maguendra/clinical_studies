"use client";

import { useState, useEffect, useCallback } from "react";
import StudyCard, { type Study } from "@/components/StudyCard";

export default function SwipeDeck() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [xpGained, setXpGained] = useState<number | null>(null);

  async function loadStudies(p: number) {
    setLoading(true);
    const res = await fetch(`/api/studies?page=${p}`);
    const data: Study[] = await res.json();
    setStudies((prev) => [...prev, ...data]);
    setLoading(false);
  }

  useEffect(() => {
    loadStudies(1);
  }, []);

  async function handleSwipe(studyId: number, direction: "left" | "right" | "up") {
    setStudies((prev) => prev.filter((s) => s.id !== studyId));

    const res = await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyId, direction }),
    });
    const data = await res.json();
    if (data.xp > 0) {
      setXpGained(data.xp);
      setTimeout(() => setXpGained(null), 1500);
    }

    if (studies.length <= 3) {
      setPage((p) => {
        loadStudies(p + 1);
        return p + 1;
      });
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const top = studies[studies.length - 1];
      if (!top) return;
      if (e.key === "ArrowRight") handleSwipe(top.id, "right");
      if (e.key === "ArrowLeft") handleSwipe(top.id, "left");
      if (e.key === "ArrowUp") handleSwipe(top.id, "up");
    },
    [studies]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading && studies.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loading && studies.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-white mb-2">C&apos;est tout pour aujourd&apos;hui !</h2>
        <p className="text-slate-400">Revenez demain pour de nouvelles études.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      {/* XP toast */}
      {xpGained && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-500 text-slate-900 font-bold px-4 py-2 rounded-full animate-bounce">
          +{xpGained} XP
        </div>
      )}

      {/* Card stack */}
      <div className="relative w-full max-w-sm h-[520px]">
        {studies.slice(-3).map((study, i, arr) => (
          <div
            key={study.id}
            className="absolute inset-0 transition-transform"
            style={{ transform: `scale(${0.95 + i * 0.025}) translateY(${(arr.length - 1 - i) * 8}px)` }}
          >
            <StudyCard
              study={study}
              isTop={i === arr.length - 1}
              onSwipe={(dir) => handleSwipe(study.id, dir)}
            />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-6 mt-8">
        <button
          onClick={() => {
            const top = studies[studies.length - 1];
            if (top) handleSwipe(top.id, "left");
          }}
          className="w-14 h-14 rounded-full bg-slate-800 border border-red-500/40 text-red-400 text-2xl flex items-center justify-center hover:bg-red-500/10 transition-colors"
          title="Ignorer (←)"
        >
          ✕
        </button>
        <button
          onClick={() => {
            const top = studies[studies.length - 1];
            if (top) handleSwipe(top.id, "up");
          }}
          className="w-14 h-14 rounded-full bg-slate-800 border border-yellow-500/40 text-yellow-400 text-2xl flex items-center justify-center hover:bg-yellow-500/10 transition-colors"
          title="Super like (↑)"
        >
          ★
        </button>
        <button
          onClick={() => {
            const top = studies[studies.length - 1];
            if (top) handleSwipe(top.id, "right");
          }}
          className="w-14 h-14 rounded-full bg-slate-800 border border-teal-500/40 text-teal-400 text-2xl flex items-center justify-center hover:bg-teal-500/10 transition-colors"
          title="Sauvegarder (→)"
        >
          ♥
        </button>
      </div>

      <p className="mt-4 text-slate-600 text-xs">← ignorer &nbsp;·&nbsp; ↑ super like &nbsp;·&nbsp; → sauvegarder</p>
    </div>
  );
}
