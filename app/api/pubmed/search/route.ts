export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { searchPubMed, fetchStudySummaries } from "@/lib/pubmed";
import { db } from "@/lib/db";
import { studies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "physiotherapy";
  const page = parseInt(searchParams.get("page") ?? "1");

  const pmids = await searchPubMed(q, page);
  const summaries = await fetchStudySummaries(pmids);

  // upsert into local DB
  for (const s of summaries) {
    await db
      .insert(studies)
      .values({
        pmid: s.pmid,
        title: s.title,
        authors: s.authors,
        year: s.year,
        journal: s.journal,
        doi: s.doi,
        sourceApi: "pubmed",
      })
      .onConflictDoNothing();
  }

  return NextResponse.json(summaries);
}
