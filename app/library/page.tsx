export const runtime = "nodejs";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { swipes, studies } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import Link from "next/link";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const saved = await db
    .select({ studyId: swipes.studyId })
    .from(swipes)
    .where(and(eq(swipes.userId, session.user.id), inArray(swipes.direction, ["right", "up"])));

  const ids = saved.map((s) => s.studyId).filter(Boolean) as number[];

  const savedStudies =
    ids.length > 0
      ? await db.select().from(studies).where(inArray(studies.id, ids))
      : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      <h1 className="text-2xl font-bold text-white mb-6">
        Ma bibliothèque{" "}
        <span className="text-slate-500 font-normal text-lg">({savedStudies.length})</span>
      </h1>

      {savedStudies.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-3">📚</p>
          <p>Swipez à droite pour sauvegarder des études.</p>
          <Link href="/swipe" className="mt-4 inline-block text-teal-400 hover:underline">
            Aller swiper →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedStudies.map((s) => (
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
              <h2 className="text-white font-semibold mb-1 leading-snug">{s.title}</h2>
              <p className="text-slate-400 text-sm">
                {s.authors?.slice(0, 2).join(", ")}
                {s.authors && s.authors.length > 2 && " et al."} · {s.year}
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
