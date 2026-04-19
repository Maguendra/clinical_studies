export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studies } from "@/lib/db/schema";
import { ilike, or, sql, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const domain = searchParams.get("domain") ?? "";
  const year = searchParams.get("year") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!q && !domain && !year) {
    return NextResponse.json([]);
  }

  let query = db.select().from(studies).$dynamic();
  const conditions = [];

  if (q) {
    conditions.push(
      or(
        ilike(studies.title, `%${q}%`),
        ilike(studies.abstract, `%${q}%`),
        sql`${studies.authors}::text ilike ${"%" + q + "%"}`
      )
    );
  }

  if (domain) conditions.push(eq(studies.domain, domain));
  if (year) conditions.push(eq(studies.year, parseInt(year) as unknown as never));

  if (conditions.length > 0) {
    const [first, ...rest] = conditions;
    query = query.where(rest.reduce((acc, c) => sql`${acc} AND ${c}`, first));
  }

  const rows = await query.orderBy(studies.year).limit(limit).offset(offset);
  return NextResponse.json(rows);
}
