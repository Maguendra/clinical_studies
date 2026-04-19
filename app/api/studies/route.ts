export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studies, swipes } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, notInArray, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = db.select().from(studies).$dynamic();

  if (session?.user?.id) {
    const swiped = db
      .select({ studyId: swipes.studyId })
      .from(swipes)
      .where(eq(swipes.userId, session.user.id));
    query = query.where(notInArray(studies.id, swiped));
  }

  const rows = await query
    .orderBy(sql`RANDOM()`)
    .limit(limit)
    .offset(offset);

  return NextResponse.json(rows);
}
