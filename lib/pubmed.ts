const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : "";

export interface PubMedSummary {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  abstract?: string;
  doi?: string;
  keywords?: string[];
}

export async function searchPubMed(query: string, page = 1, retmax = 10): Promise<string[]> {
  const retstart = (page - 1) * retmax;
  const url = `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${retmax}&retstart=${retstart}&retmode=json${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  return data.esearchresult?.idlist ?? [];
}

export async function fetchStudySummaries(pmids: string[]): Promise<PubMedSummary[]> {
  if (!pmids.length) return [];
  const url = `${BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  const result = data.result;

  return pmids
    .filter((id) => result[id])
    .map((id) => {
      const r = result[id];
      return {
        pmid: id,
        title: r.title ?? "",
        authors: (r.authors ?? []).map((a: { name: string }) => a.name),
        journal: r.fulljournalname ?? r.source ?? "",
        year: parseInt(r.pubdate?.slice(0, 4) ?? "0"),
        doi: r.elocationid?.replace("doi: ", "") ?? undefined,
      };
    });
}

export async function fetchAbstract(pmid: string): Promise<string> {
  const url = `${BASE}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  return res.text();
}
