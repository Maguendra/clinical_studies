import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../lib/db/schema";

const QUERIES = [
  "physiotherapy randomized controlled trial",
  "physical therapy rehabilitation clinical trial",
  "musculoskeletal physiotherapy",
  "exercise therapy chronic pain",
  "manual therapy spine",
  "physiotherapy neurological rehabilitation",
  "cardiopulmonary physiotherapy",
  "sports injury physical therapy",
];

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : "";

async function searchPMIDs(query: string): Promise<string[]> {
  const url = `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=20&retmode=json${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.esearchresult?.idlist ?? [];
}

async function fetchSummaries(pmids: string[]) {
  if (!pmids.length) return [];
  const url = `${BASE}/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return pmids
    .filter((id) => data.result?.[id])
    .map((id) => {
      const r = data.result[id];
      return {
        pmid: id,
        title: r.title ?? "",
        authors: (r.authors ?? []).map((a: { name: string }) => a.name) as string[],
        year: parseInt(r.pubdate?.slice(0, 4) ?? "0") || null,
        journal: r.fulljournalname ?? r.source ?? null,
        doi: r.elocationid?.replace("doi: ", "") || null,
        sourceApi: "pubmed" as const,
      };
    });
}

async function fetchAbstracts(pmids: string[]): Promise<Map<string, string>> {
  if (!pmids.length) return new Map();
  const url = `${BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&rettype=xml&retmode=xml${API_KEY}`;
  const res = await fetch(url);
  const xml = await res.text();
  const map = new Map<string, string>();
  const articleRe = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let art;
  while ((art = articleRe.exec(xml)) !== null) {
    const pmidMatch = art[1].match(/<PMID[^>]*>(\d+)<\/PMID>/);
    const abstractMatch = art[1].match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
    if (pmidMatch && abstractMatch) {
      const pmid = pmidMatch[1];
      const abstract = abstractMatch
        .map((t) => t.replace(/<[^>]+>/g, "").trim())
        .join(" ");
      map.set(pmid, abstract);
    }
  }
  return map;
}

function inferDomain(title: string, query: string): string {
  const t = title.toLowerCase();
  if (t.includes("neuro") || t.includes("stroke") || t.includes("parkinson")) return "Neurologie";
  if (t.includes("cardiac") || t.includes("heart") || t.includes("pulmon")) return "Cardio-pulmonaire";
  if (t.includes("sport") || t.includes("athlete") || t.includes("acl")) return "Sport";
  if (t.includes("spine") || t.includes("back") || t.includes("lumbar") || t.includes("cervical")) return "Rachis";
  if (t.includes("knee") || t.includes("hip") || t.includes("shoulder") || t.includes("shoulder")) return "Orthopédie";
  if (t.includes("pain") || t.includes("chronic")) return "Douleur chronique";
  if (query.includes("musculoskeletal")) return "Musculo-squelettique";
  return "Rééducation";
}

async function main() {
  const client = postgres(process.env.DATABASE_URL!, { max: 3 });
  const db = drizzle(client, { schema });

  let total = 0;

  for (const query of QUERIES) {
    console.log(`\n📡 Query: "${query}"`);
    const pmids = await searchPMIDs(query);
    console.log(`   Found ${pmids.length} PMIDs`);

    const summaries = await fetchSummaries(pmids);
    const abstracts = await fetchAbstracts(pmids);

    for (const s of summaries) {
      const abstract = abstracts.get(s.pmid) ?? null;
      const domain = inferDomain(s.title, query);

      await db
        .insert(schema.studies)
        .values({ ...s, abstract, domain })
        .onConflictDoNothing();
      total++;
    }

    console.log(`   ✓ Inserted ${summaries.length} studies`);
    // Respect PubMed rate limit (10 req/s with key, 3 without)
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n✅ Done — ${total} studies processed`);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
