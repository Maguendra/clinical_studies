"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

const DOMAINS = [
  "Rééducation", "Rachis", "Neurologie", "Douleur chronique",
  "Cardio-pulmonaire", "Orthopédie", "Sport", "Musculo-squelettique",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

interface Study {
  id: number;
  title: string;
  authors: string[] | null;
  year: number | null;
  journal: string | null;
  abstract: string | null;
  domain: string | null;
  doi: string | null;
}

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("");
  const [year, setYear] = useState("");
  const [results, setResults] = useState<Study[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (domain) params.set("domain", domain);
      if (year) params.set("year", year);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setResults(data);
      setSearched(true);
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      <h1 className="text-2xl font-bold text-white mb-6">Recherche</h1>

      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Mots-clés, auteur, titre…"
          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
        />

        <div className="flex gap-3">
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="">Tous les domaines</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-36 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="">Toutes années</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-900 font-bold transition-colors"
        >
          {isPending ? "Recherche…" : "Rechercher"}
        </button>
      </form>

      {searched && results.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-3xl mb-3">🔍</p>
          <p>Aucune étude trouvée pour ces critères.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-slate-500 text-sm">{results.length} résultat{results.length > 1 ? "s" : ""}</p>
          {results.map((s) => (
            <Link
              key={s.id}
              href={`/study/${s.id}`}
              className="block bg-slate-800 border border-slate-700 hover:border-teal-500/40 rounded-2xl p-5 transition-colors"
            >
              {s.domain && (
                <span className="inline-block bg-teal-500/15 text-teal-400 text-xs px-2 py-0.5 rounded-full mb-2">
                  {s.domain}
                </span>
              )}
              <h2 className="text-white font-semibold leading-snug mb-1 line-clamp-2">{s.title}</h2>
              <p className="text-slate-400 text-sm">
                {s.authors?.slice(0, 2).join(", ")}
                {s.authors && s.authors.length > 2 && " et al."}
                {s.year && ` · ${s.year}`}
              </p>
              {s.abstract && (
                <p className="text-slate-500 text-sm mt-2 line-clamp-2">{s.abstract}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
