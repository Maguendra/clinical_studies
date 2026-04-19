export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { swipes, profiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const XP_MAP: Record<string, number> = { right: 5, up: 10, left: 0 };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studyId, direction } = await req.json();
  if (!studyId || !["left", "right", "up"].includes(direction)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db
    .insert(swipes)
    .values({ userId: session.user.id, studyId, direction })
    .onConflictDoNothing();

  const xp = XP_MAP[direction];
  if (xp > 0) {
    await db
      .update(profiles)
      .set({ xp: sql`${profiles.xp} + ${xp}` })
      .where(eq(profiles.id, session.user.id));
  }

  return NextResponse.json({ ok: true, xp });
}
